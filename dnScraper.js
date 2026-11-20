const { writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const cheerio = require('cheerio');
const request = require('request-promise');

const source = 'https://freenewsapi.ai/sources/dn-pt';
const sitemap = 'https://www.dn.pt/news_sitemap.xml';

function addArticle(articles, title, href, date) {
  const published = Date.parse(date);
  if (!title || !href || !Number.isFinite(published)) return;

  const url = new URL(href);
  if (url.protocol !== 'https:' || !['www.dn.pt', 'dn.pt'].includes(url.hostname)) return;
  url.search = '';
  url.hash = '';
  articles.set(url.href, { title, date: new Date(published).toISOString(), url: url.href });
}

async function readSitemap() {
  const xml = await request({ uri: sitemap, timeout: 15000 });
  const $ = cheerio.load(xml, { xml: true });
  const articles = new Map();
  $('urlset > url').each((_, entry) => {
    const item = $(entry);
    addArticle(articles, item.find('news\\:title').text().trim(), item.children('loc').text().trim(),
      item.find('news\\:publication_date').text().trim());
  });
  if (!articles.size) throw new Error('sitemap sem artigos válidos');
  return articles;
}

async function readIndex() {
  const html = await request({ uri: source, timeout: 15000 });
  const $ = cheerio.load(html);
  const articles = new Map();

  $('.card a[href^="https://www.dn.pt/"], .card a[href^="https://dn.pt/"]').each((_, element) => {
    const anchor = $(element);
    const title = anchor.text().trim();
    const timestamp = anchor.next('div').text().trim()
      .match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) UTC\b/);
    if (!title || !timestamp) return;

    addArticle(articles, title, anchor.attr('href'), `${timestamp[1]}T${timestamp[2]}:00Z`);
  });

  if (!articles.size) {
    throw new Error(`Nenhum artigo com data de publicação encontrado em ${source}`);
  }

  return articles;
}

readSitemap()
  .catch(error => {
    const reason = error.statusCode ? `HTTP ${error.statusCode}` : error.message;
    console.warn(`Sitemap do DN indisponível (${reason}). A consultar a FreeNewsAPI.`);
    return readIndex();
  })
  .then(articles => [...articles.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10))
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
