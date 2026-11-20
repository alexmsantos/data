const { writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const cheerio = require('cheerio');
const request = require('request-promise');

const origin = 'https://www.jornaldenegocios.pt';
const latest = origin + '/noticias-no-minuto';
const feed = origin + '/rss';

function articleUrl(href) {
  if (!href || !URL.canParse(href, origin)) return;
  const url = new URL(href, origin);
  if (url.origin !== origin || !url.pathname.includes('/detalhe/')) return;
  url.search = '';
  url.hash = '';
  return url.href;
}

async function readFeed() {
  const body = await request({ uri: feed, encoding: null, gzip: true, timeout: 15000 });
  const encoding = body.subarray(0, 120).toString('ascii').match(/encoding=["']([^"']+)["']/i)?.[1];
  const $ = cheerio.load(new TextDecoder(encoding ?? 'utf-8').decode(body), { xml: true });
  const articles = new Map();

  $('channel > item').each((_, element) => {
    const item = $(element);
    const url = articleUrl(item.children('link').text().trim() || item.children('guid').text().trim());
    const title = item.children('title').text().trim();
    const published = Date.parse(item.children('pubDate').text().trim());
    if (url && title && Number.isFinite(published)) {
      articles.set(url, {
        title,
        url,
        date_published: new Date(published).toISOString(),
        media: 'Negócios',
      });
    }
  });

  if (!articles.size) throw new Error('RSS sem artigos com data de publicação válida');
  return articles;
}

async function readLatest(feedArticles) {
  const html = await request({ uri: latest, gzip: true, timeout: 15000 });
  const $ = cheerio.load(html);
  const articles = new Map();

  // The listing shows only a time of day or no time at all. Match URLs
  // against the official RSS to use the full publication timestamp.
  $('.listagem_destaques article.destaque > .text_container h2 a[href]').each((_, element) => {
    const anchor = $(element);
    const article = feedArticles.get(articleUrl(anchor.attr('href')));
    const title = anchor.text().trim().replace(/^(Ao minuto:)\s*/i, '$1 ');
    if (article && title) articles.set(article.url, { ...article, title });
  });

  if (!articles.size) throw new Error('Nenhum artigo da lista encontrado no RSS');
  return [...articles.values()];
}

async function main() {
  const feedArticles = await readFeed();
  const articles = await readLatest(feedArticles).catch(error => {
    console.warn(`Página de notícias do Negócios indisponível (${error.message}). A usar o RSS.`);
    return [...feedArticles.values()];
  });
  const latestArticles = articles.sort((a, b) => b.date_published.localeCompare(a.date_published)).slice(0, 10);
  await writeFile(join(__dirname, 'digest', 'latest--negocios.json'), JSON.stringify(latestArticles, null, 2) + '\n');
  console.log(`Negócios: ${latestArticles.length} artigos recolhidos.`);
}

main().catch(error => {
  console.error(`Falha ao consultar o Jornal de Negócios: ${error.message}`);
  process.exitCode = 1;
});
