const { writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const cheerio = require('cheerio');
const request = require('request-promise');

const source = 'https://freenewsapi.ai/sources/dn-pt';

async function scrapeLatest() {
  const html = await request({ uri: source, timeout: 15000 });
  const $ = cheerio.load(html);
  const articles = new Map();

  $('.card a[href^="https://www.dn.pt/"], .card a[href^="https://dn.pt/"]').each((_, element) => {
    const anchor = $(element);
    const title = anchor.text().trim();
    const timestamp = anchor.next('div').text().trim()
      .match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) UTC\b/);
    if (!title || !timestamp) return;

    const published = Date.parse(`${timestamp[1]}T${timestamp[2]}:00Z`);
    if (!Number.isFinite(published)) return;

    const url = new URL(anchor.attr('href'));
    url.search = '';
    url.hash = '';
    articles.set(url.href, {
      title,
      date: new Date(published).toISOString(),
      url: url.href,
    });
  });

  if (!articles.size) {
    throw new Error(`Nenhum artigo com data de publicação encontrado em ${source}`);
  }

  return [...articles.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
}

scrapeLatest()
  .then(async articles => {
    const fields = articles.flatMap(({ title, url, date }) => [title, url, date]);
    await writeFile(join(__dirname, 'dn.json'), JSON.stringify({ ...fields }));
    console.log(JSON.stringify(articles, null, 2));
  })
  .catch(error => {
    const message = error.statusCode ? `HTTP ${error.statusCode} ao consultar ${source}` : error.message;
    console.error(`Falha ao consultar o Diário de Notícias: ${message}`);
    process.exitCode = 1;
  });
