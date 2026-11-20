const { writeFile } = require('node:fs/promises');
const { join } = require('node:path');
const cheerio = require('cheerio');
const request = require('request-promise');

const source = new URL('https://www.cmjornal.pt/cm-ao-minuto');
const limit = 10;

// The listing displays publication times in mainland Portugal time.
process.env.TZ = 'Europe/Lisbon';

function publicationDate(label, now) {
  const match = label.match(/^(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [day, month, hour, minute] = match.slice(1).map(Number);
  const year = now.getFullYear() - Number(month > now.getMonth() + 1);
  const date = new Date(year, month - 1, day, hour, minute);

  if (date.getMonth() !== month - 1 || date.getDate() !== day || hour > 23 || minute > 59) {
    return null;
  }

  return date.toISOString();
}

async function scrapeLatest() {
  const articles = new Map();
  const now = new Date();
  let page = source;

  // The initial listing contains eight entries. The next page completes the digest.
  for (let pageIndex = 0; page && pageIndex < 2 && articles.size < limit; pageIndex++) {
    const $ = cheerio.load(await request({
      uri: page.href,
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsDigest/1.0)',
        ...(pageIndex > 0 && { 'X-Requested-With': 'XMLHttpRequest' }),
      },
    }));

    $('.bloco_noticia').each((_, element) => {
      const article = $(element);
      const anchor = article.find('a.destaque_titulo').first();
      const title = anchor.find('h2').text().trim();
      const href = anchor.attr('href');
      const date = publicationDate(article.find('.date_noticia').text().trim(), now);
      if (!title || !href || !date) return;

      const url = new URL(href, source);
      if (url.origin !== source.origin) return;

      url.search = '';
      url.hash = '';
      articles.set(url.href, { title, url: url.href, date });
    });

    const next = $('a[data-ajax-url^="/cm-ao-minuto/loadmore?"]').attr('data-ajax-url');
    const nextPage = next && new URL(next, source);
    page = nextPage && nextPage.href !== page.href ? nextPage : null;
  }

  if (!articles.size) {
    throw new Error(`Nenhum artigo com data de publicação encontrado em ${source}`);
  }

  return [...articles.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

scrapeLatest()
  .then(async articles => {
    await writeFile(join(__dirname, 'cm.json'), JSON.stringify({ ...articles }));
  })
  .catch(error => {
    const message = error.statusCode ? `HTTP ${error.statusCode} ao consultar o CM ao Minuto` : error.message;
    console.error(`Falha ao consultar o Correio da Manhã: ${message}`);
    process.exitCode = 1;
  });
