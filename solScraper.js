const { randomUUID } = require('node:crypto');
const { rename, rm, writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const cheerio = require('cheerio');
const request = require('request-promise');

const origin = 'https://sol.iol.pt';
const latest = origin + '/ultimas';
const feed = origin + '/rss.xml';
const newsFeed = 'https://news.google.com/rss/search?q=site%3Asol.iol.pt+when%3A2d&hl=pt-PT&gl=PT&ceid=PT%3Apt-150';
const limit = 10;

async function download(uri, timeout = 8000) {
  try {
    return await request({ uri, timeout, gzip: true });
  } catch (error) {
    if (!error.statusCode) throw error;
    const challenge = error.response?.headers?.['cf-mitigated'] === 'challenge'
      || (error.statusCode === 403 && typeof error.error === 'string'
        && error.error.includes('/cdn-cgi/challenge-platform/'));
    if (challenge) {
      throw new Error(`HTTP ${error.statusCode}: desafio da Cloudflare`);
    }
    throw new Error(`HTTP ${error.statusCode}`);
  }
}

function articleUrl(href) {
  if (!href || !URL.canParse(href, origin)) return;
  const url = new URL(href, origin);
  if (url.origin !== origin || !/\/noticias\/[^/]+\/\d{8}\/[a-f0-9]{24}\/?$/.test(url.pathname)) return;
  return origin + url.pathname.replace(/\/$/, '');
}

function publicationDate(value) {
  const timestamp = Date.parse(value);
  if (Number.isFinite(timestamp)) return new Date(timestamp).toISOString();
}

async function readLatest() {
  const $ = cheerio.load(await download(latest));
  const articles = new Map();
  $('main .block--post-title a[href]').each((_, anchor) => {
    const url = articleUrl($(anchor).attr('href'));
    const title = $(anchor).text().trim();
    if (url && title) articles.set(url, { title, url });
  });
  if (!articles.size) throw new Error('Nenhum artigo encontrado em /ultimas');
  return [...articles.values()].slice(0, 12);
}

async function readFeed() {
  const $ = cheerio.load(await download(feed), { xml: true });
  const articles = new Map();
  $('rss > channel > item').each((_, element) => {
    const item = $(element);
    const url = articleUrl(item.children('link').text().trim());
    const title = item.children('title').text().trim();
    const date = publicationDate(item.children('pubDate').text().trim());
    if (url && title && date) articles.set(url, { title, url, date });
  });
  if (!articles.size) throw new Error('Nenhum artigo com hora de publicação encontrado no RSS oficial');
  return articles;
}

async function readArticleDate(url) {
  try {
    const $ = cheerio.load(await download(url, 6000));
    const date = publicationDate($('meta[name="publish-date"]').attr('content'));
    if (!date) throw new Error('Metadado publish-date inválido ou em falta');
    return date;
  } catch (error) {
    console.warn(`Falha ao obter a hora de publicação de ${url} (${error.message})`);
  }
}

async function readNewsFeed() {
  const $ = cheerio.load(await download(newsFeed), { xml: true });
  const articles = new Map();
  $('rss > channel > item').each((_, element) => {
    const item = $(element);
    const publisher = item.children('source');
    if (publisher.attr('url') !== origin) return;
    const url = item.children('link').text().trim();
    if (!url.startsWith('https://news.google.com/rss/articles/')) return;
    const headline = item.children('title').text().trim();
    const suffix = ' - ' + publisher.text().trim();
    const title = headline.endsWith(suffix) ? headline.slice(0, -suffix.length).trim() : headline;
    const date = publicationDate(item.children('pubDate').text().trim());
    if (title && date) articles.set(url, { title, url, date });
  });
  if (!articles.size) throw new Error('O Google Notícias não devolveu artigos válidos do SOL');
  return [...articles.values()];
}

async function scrapeLatest() {
  const [listing, rss] = await Promise.allSettled([readLatest(), readFeed()]);
  if (rss.status === 'rejected') console.warn(`RSS do SOL indisponível (${rss.reason.message}).`);

  let articles;
  if (listing.status === 'fulfilled') {
    const dates = rss.status === 'fulfilled' ? rss.value : new Map();
    articles = listing.value.map(article => ({ ...article, date: dates.get(article.url)?.date }));
    const missing = articles.filter(article => !article.date);
    for (let index = 0; index < missing.length; index += 4) {
      await Promise.all(missing.slice(index, index + 4).map(async article => {
        article.date = await readArticleDate(article.url);
      }));
    }
  } else {
    console.warn(`Página de últimas do SOL indisponível (${listing.reason.message}).`);
    articles = rss.status === 'fulfilled' ? [...rss.value.values()] : [];
  }

  const dated = articles.filter(article => article.date);
  return dated.length || rss.status === 'rejected' ? dated : [...rss.value.values()];
}

async function main() {
  let latestArticles = await scrapeLatest();
  let source = 'fontes oficiais';
  if (!latestArticles.length) {
    console.warn('SOL: as fontes oficiais não devolveram artigos válidos. A consultar o Google Notícias.');
    latestArticles = await readNewsFeed();
    source = 'Google Notícias';
  }
  const articles = latestArticles
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map(({ title, url, date }) => ({ title, url, date_published: date, media: 'SOL' }));
  const output = join(__dirname, 'digest', 'latest--sol.json');
  const temporary = `${output}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(articles, null, 2) + '\n');
    await rename(temporary, output);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`SOL: ${articles.length} artigos recolhidos via ${source}.`);
}

main().catch(error => {
  console.error(`Falha ao consultar o SOL: ${error.message}`);
  process.exitCode = 1;
});
