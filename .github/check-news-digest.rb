require 'fileutils'
require 'json'
require 'open3'
require 'time'
require 'tmpdir'
require 'uri'
require 'yaml'

workflow = YAML.load_file('.github/workflows/latest-news-pt.yml')
steps = workflow.fetch('jobs').fetch('build').fetch('steps')
merge_index = steps.index { |step| step['name'] == 'Merge files' }
abort 'Passo de merge do digest em falta' unless merge_index

collection_steps = steps.take(merge_index).select { |step| step.key?('run') }
# Read the same source list as the publish workflow, including any muted media.
digest_files = steps.fetch(merge_index).fetch('env').fetch('DIGEST_FILES').split
unless digest_files.any? && digest_files.all? { |path| path.match?(%r{\Adigest/latest--[a-z0-9-]+\.json\z}) }
  abort 'Não foi possível identificar os ficheiros do digest no passo de merge'
end

def valid_article?(article)
  return false unless article.is_a?(Hash)
  return false unless %w[title url date_published media].all? do |field|
    article[field].is_a?(String) && !article[field].strip.empty?
  end

  uri = URI.parse(article.fetch('url'))
  Time.iso8601(article.fetch('date_published'))
  uri.is_a?(URI::HTTP) && uri.host && !article.fetch('title').include?("\uFFFD")
rescue URI::InvalidURIError, ArgumentError
  false
end

report = []
# A fresh directory prevents stale snapshots from passing the check.
Dir.mktmpdir('news-digest-') do |directory|
  FileUtils.cp(Dir.glob('*.js'), directory)
  File.symlink(File.expand_path('node_modules'), File.join(directory, 'node_modules'))
  Dir.mkdir(File.join(directory, 'digest'))

  collection_steps.each do |step|
    name = step.fetch('name')
    puts "A verificar #{name}"
    stdout, stderr, status = Open3.capture3(
      'timeout', '45s', 'bash', '-eo', 'pipefail', '-c', step.fetch('run'), chdir: directory
    )
    if !status.success?
      details = stderr.strip.empty? ? stdout : stderr
      report << [name, "Falha na execução (código #{status.exitstatus})"]
      warn details.lines.last(8).map { |line| "  #{line}" }.join
    elsif stderr.match?(/A consultar (a FreeNewsAPI|o sitemap)|A usar o RSS/)
      report << [name, 'A fonte principal falhou e foi usada a alternativa']
      warn stderr
    end
  end

  digest_files.each do |path|
    begin
      articles = JSON.parse(File.read(File.join(directory, path)))
      if !articles.is_a?(Array) || articles.empty?
        report << [path, 'Sem artigos']
      elsif articles.any? { |article| !valid_article?(article) }
        report << [path, 'Há artigos com título, URL, data ou meio inválidos']
      else
        report << [path, "OK · #{articles.size} artigos"]
      end
    rescue Errno::ENOENT, JSON::ParserError
      report << [path, 'Ficheiro em falta ou JSON inválido']
    end
  end
end

failed = report.any? { |_, result| !result.start_with?('OK') }
summary = ["### Verificação do digest PT", '', '| Origem ou passo | Resultado |', '| --- | --- |']
summary.concat(report.map { |name, result| "| #{name} | #{result} |" })
puts summary.join("\n")
File.open(ENV.fetch('GITHUB_STEP_SUMMARY'), 'a') { |file| file.puts(summary) } if ENV['GITHUB_STEP_SUMMARY']
exit(failed ? 1 : 0)
