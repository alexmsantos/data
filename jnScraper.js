const { execFile } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { rename, rm, writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const { promisify } = require('node:util');
const cheerio = require('cheerio');

const run = promisify(execFile);
const origin = 'https://www.jn.pt';
const latest = origin + '/ultimas';
const sitemap = origin + '/feed/news/sitemap.xml';
const newsFeed = 'https://news.google.com/rss/search?q=site%3Ajn.pt+when%3A1d&hl=pt-PT&gl=PT&ceid=PT%3Apt-150';

async function download(url, retries = 2) {
  const { stdout } = await run('curl', [
    '--fail', '--silent', '--show-error', '--location', '--max-time', '15',
    '--retry', String(retries), '--retry-max-time', '30', '--retry-connrefused', url,
  ], { maxBuffer: 16 * 1024 * 1024 });
  return stdout;
}

function normalizeArticles(entries, articleOrigin = origin) {
  const articles = new Map();
  for (const { title, href, date } of entries) {
    const published = Date.parse(date);
    if (!title || !href || !Number.isFinite(published) || !URL.canParse(href, latest)) continue;
    const url = new URL(href, latest);
    if (url.origin !== articleOrigin) continue;
    if (articleOrigin === origin) url.search = '';
    url.hash = '';
    articles.set(url.href, {
      title,
      url: url.href,
      date_published: new Date(published).toISOString(),
      media: 'JN',
    });
  }
  if (!articles.size) throw new Error('Nenhum artigo com data de publicação válida');
  return [...articles.values()]
    .sort((a, b) => b.date_published.localeCompare(a.date_published))
    .slice(0, 10);
}

async function readLatest() {
  const html = await download(latest);
  const $ = cheerio.load(html);

  // Next.js delivers the article list and its publication dates in Flight data.
  const payload = $('script').map((_, script) => {
    const chunk = $(script).text().trim().match(/^self\.__next_f\.push\((\[1,.*\])\);?$/s);
    return chunk ? JSON.parse(chunk[1])[1] : null;
  }).get().join('');

  const entries = [];
  for (const line of payload.split('\n')) {
    if (!line.includes('Slice_LatestNews')) continue;
    const record = line.match(/(?:^|>)[\da-f]+:(\[\["\$".*)$/);
    if (!record) continue;
    for (const element of JSON.parse(record[1])) {
      const blocks = element?.[3]?.data?.dataset?.Blocks ?? [];
      for (const block of blocks) {
        if (block.Config?.Layout !== 'Slice_LatestNews') continue;
        for (const item of block.Contents) {
          if (item.Type === 'Article') {
            entries.push({ title: item.Title, href: item.Url, date: item.Date });
          }
        }
      }
    }
  }
  return normalizeArticles(entries);
}

async function readSitemap() {
  const xml = await download(sitemap);
  const $ = cheerio.load(xml, { xml: true });
  const entries = $('urlset > url').map((_, element) => {
    const item = $(element);
    return {
      title: item.find('news\\:title').text().trim(),
      href: item.children('loc').text().trim(),
      date: item.find('news\\:publication_date').text().trim(),
    };
  }).get();
  return normalizeArticles(entries);
}

async function readNewsFeed() {
  const $ = cheerio.load(await download(newsFeed, 0), { xml: true });
  const entries = $('rss > channel > item').map((_, element) => {
    const item = $(element);
    const publisher = item.children('source');
    if (!['https://www.jn.pt', 'https://jn.pt'].includes(publisher.attr('url'))) return null;
    const href = item.children('link').text().trim();
    if (!href.startsWith('https://news.google.com/rss/articles/')) return null;
    const title = item.children('title').text().trim();
    const suffix = ' - ' + publisher.text().trim();
    return {
      title: title.endsWith(suffix) ? title.slice(0, -suffix.length) : title,
      href,
      date: item.children('pubDate').text().trim(),
    };
  }).get();
  return normalizeArticles(entries, 'https://news.google.com');
}

async function main() {
  let source = 'JN';
  const articles = await readLatest()
    .catch(error => {
      console.warn(`Página de últimas do JN indisponível (${error.message}). A consultar o sitemap.`);
      return readSitemap();
    })
    .catch(error => {
      console.warn(`Sitemap do JN indisponível (${error.message}). A consultar o Google Notícias.`);
      source = 'Google Notícias';
      return readNewsFeed();
    });
  const output = join(__dirname, 'digest', 'latest--jn.json');
  const temporary = `${output}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(articles, null, 2) + '\n');
    await rename(temporary, output);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`JN: ${articles.length} artigos recolhidos via ${source}.`);
}

main().catch(error => {
  console.error(`Falha ao consultar o Jornal de Notícias: ${error.message}`);
  process.exitCode = 1;
});
