const { parse } = require('rss-to-json');
const { writeFile } = require('node:fs/promises');
const cheerio = require('cheerio');
const request = require('request-promise');

const site = 'https://rr.pt';
const feedUrl = site + '/rssfeed-ultimas';
const latestUrl = site + '/ultimas';

async function loadPage(url) {
    try {
        return cheerio.load(await request({ uri: url, timeout: 15000 }));
    } catch (error) {
        if (!error.statusCode) throw error;
        throw new Error(`HTTP ${error.statusCode} ao consultar ${url}`);
    }
}

function articleUrl(href) {
    const url = new URL(href, site);
    const articlePath = /\/(?:noticia|artigo|especial)\/.+\/\d{4}\/\d{2}\/\d{2}\/.+\/\d+\/?$/;
    if (url.origin === site && articlePath.test(url.pathname)) {
        return site + url.pathname.replace(/\/?$/, '/');
    }
}

async function scrapeArticle(link) {
    const $ = await loadPage(link);
    const meta = name => $(`meta[property="${name}"], meta[name="${name}"]`).first().attr('content');
    const title = (meta('og:title') || $('h1').first().text()).trim();
    const published = Date.parse(meta('article:published_time') || $('time[datetime]').first().attr('datetime'));
    if (!title || !Number.isFinite(published)) {
        throw new Error(`Título ou data de publicação em falta em ${link}`);
    }

    const image = meta('og:image');
    return {
        id: link,
        title,
        description: meta('og:description') || meta('description') || '',
        link,
        published,
        created: published,
        category: [],
        enclosures: image ? [{
            url: new URL(image, link).href,
            length: meta('og:image:length') || '',
            type: meta('og:image:type') || '',
        }] : [],
        media: {},
    };
}

async function scrapeLatest() {
    const $ = await loadPage(latestUrl);
    const links = new Set();
    const main = $('main, [role="main"]');
    const anchors = main.length ? main.find('a[href]') : $('a[href]');
    anchors.each((_, anchor) => {
        const href = $(anchor).attr('href').trim();
        if (!href.startsWith('/') && !href.startsWith(site + '/')) return;
        const link = articleUrl(href);
        if (link) links.add(link);
    });
    if (!links.size) throw new Error(`Nenhum link de notícia encontrado em ${latestUrl}`);

    const items = [];
    const latestLinks = [...links].slice(0, 25);
    for (let index = 0; index < latestLinks.length; index += 4) {
        items.push(...await Promise.all(latestLinks.slice(index, index + 4).map(scrapeArticle)));
    }
    items.sort((a, b) => b.published - a.published);

    return {
        title: 'Renascença - Noticias',
        description: 'Acompanhe notícias, atualidade, programas e rádio online em Portugal com a Renascença – informação confiável e atualizada diariamente.',
        link: site + '/',
        image: '',
        category: [],
        items,
    };
}

async function getLatest() {
    try {
        const feed = await parse(feedUrl, { timeout: 15000 });
        if (feed.items?.length) return feed;
        console.warn('RSS da Renascença sem notícias. A consultar /ultimas.');
    } catch (error) {
        if (error.response?.status !== 403) throw error;
        console.warn('RSS da Renascença devolveu HTTP 403. A consultar /ultimas.');
    }
    return scrapeLatest();
}

async function main() {
    const latest = await getLatest();
    const json = JSON.stringify(latest, null, 3);
    await writeFile('renascenca.json', json);
    console.log(json);
}

main().catch(error => {
    console.error('Falha ao atualizar renascenca.json:', error.message);
    process.exitCode = 1;
});
