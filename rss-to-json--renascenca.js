const { parse } = require('rss-to-json');
const { execFile } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { rename, rm, writeFile } = require('node:fs/promises');
const { promisify } = require('node:util');
const cheerio = require('cheerio');
const request = require('request-promise');

const site = 'https://rr.pt';
const feedUrl = site + '/rssfeed-ultimas';
const latestUrl = site + '/ultimas';
const newsFeed = 'https://news.google.com/rss/search?q=site%3Arr.pt+when%3A1d&hl=pt-PT&gl=PT&ceid=PT%3Apt-150';
const run = promisify(execFile);
const publisherHosts = new Set(['rr.pt', 'www.rr.pt', 'rr.sapo.pt']);

async function loadPage(url, timeout = 8000) {
    try {
        return cheerio.load(await request({ uri: url, timeout }));
    } catch (error) {
        if (!error.statusCode) throw error;
        throw new Error(`HTTP ${error.statusCode} ao consultar ${url}`);
    }
}

function articleUrl(href) {
    if (!href || !URL.canParse(href, site)) return;
    const url = new URL(href, site);
    const articlePath = /^\/(?:bola-branca\/)?(?:noticia|artigo|especial)\/[^/]+\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/\d+\/?$/;
    if (['https:', 'http:'].includes(url.protocol) && publisherHosts.has(url.host) &&
        articlePath.test(url.pathname)) {
        return site + url.pathname.replace(/\/?$/, '/');
    }
}

function canonicalArticle($, pageUrl) {
    const canonical = $('link[rel="canonical"]').first().attr('href');
    const openGraph = $('meta[property="og:url"]').first().attr('content');
    return articleUrl(canonical) || articleUrl(openGraph) || articleUrl(pageUrl);
}

async function resolveGoogleArticle(link, timeout) {
    try {
        const { stdout } = await run('curl', [
            '--silent', '--show-error', '--location', '--max-redirs', '5',
            '--proto', '=https', '--proto-redir', '=https', '--max-time', String(timeout),
            '--write-out', '\n%{url_effective}', link,
        ], { maxBuffer: 4 * 1024 * 1024 });
        const end = stdout.lastIndexOf('\n');
        const pageUrl = new URL(stdout.slice(end + 1));
        if (!publisherHosts.has(pageUrl.host)) return;
        return canonicalArticle(cheerio.load(stdout.slice(0, end)), pageUrl.href);
    } catch {
        return undefined;
    }
}

async function scrapeArticle(link, timeout) {
    const $ = await loadPage(link, timeout);
    link = canonicalArticle($, link);
    const meta = name => $(`meta[property="${name}"], meta[name="${name}"]`).first().attr('content');
    const title = (meta('og:title') || $('h1').first().text()).trim();
    const published = Date.parse(meta('article:published_time') || $('time[datetime]').first().attr('datetime'));
    if (!isValidTitle(title) || !Number.isFinite(published)) {
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
    const deadline = Date.now() + 6000;
    const latestLinks = [...links].slice(0, 25);
    for (let index = 0; index < latestLinks.length; index += 4) {
        const timeout = Math.min(8000, deadline - Date.now());
        if (timeout <= 0) break;
        const batch = await Promise.allSettled(
            latestLinks.slice(index, index + 4).map(link => scrapeArticle(link, timeout))
        );
        for (const result of batch) {
            if (result.status === 'fulfilled') items.push(result.value);
            else console.warn(result.reason.message);
        }
    }
    if (!items.length) throw new Error('Nenhum artigo válido em /ultimas');
    return makeFeed(items.sort((a, b) => b.published - a.published));
}

function makeFeed(items) {
    return {
        title: 'Renascença - Noticias',
        description: 'Acompanhe notícias, atualidade, programas e rádio online em Portugal com a Renascença – informação confiável e atualizada diariamente.',
        link: site + '/',
        image: '',
        category: [],
        items,
    };
}

async function readNewsFeed(allowGoogleLinks) {
    const { stdout } = await run('curl', [
        '--fail', '--silent', '--show-error', '--location', '--max-time', '8', newsFeed,
    ], { maxBuffer: 16 * 1024 * 1024 });
    const $ = cheerio.load(stdout, { xml: true });
    const items = new Map();

    $('rss > channel > item').each((_, element) => {
        const item = $(element);
        const source = item.children('source');
        const publisher = source.attr('url');
        if (!URL.canParse(publisher) || !publisherHosts.has(new URL(publisher).host)) return;
        const link = item.children('link').text().trim();
        // Google Notícias reports Renascença timestamps one hour before the publisher.
        const published = Date.parse(item.children('pubDate').text().trim()) + 60 * 60 * 1000;
        if (!link.startsWith('https://news.google.com/rss/articles/') || !Number.isFinite(published)) return;

        const headline = item.children('title').text().trim();
        const suffix = ' - ' + source.text().trim();
        const title = headline.endsWith(suffix) ? headline.slice(0, -suffix.length).trim() : headline;
        if (!isValidTitle(title)) return;

        items.set(link, {
            id: link, title, description: '', link, published, created: published,
            category: [], enclosures: [], media: {},
        });
    });
    if (!items.size) throw new Error('Nenhum artigo válido da Renascença no Google Notícias');
    const candidates = [...items.values()].sort((a, b) => b.published - a.published);
    const resolved = new Map();
    const deadline = Date.now() + 10000;
    for (let index = 0; index < candidates.length && resolved.size < 10; index += 5) {
        const timeout = Math.min(3, (deadline - Date.now()) / 1000);
        if (timeout <= 0) break;
        const batch = candidates.slice(index, index + 5);
        const links = await Promise.all(batch.map(item => resolveGoogleArticle(item.link, timeout)));
        for (const [index, link] of links.entries()) {
            if (link && !resolved.has(link)) resolved.set(link, { ...batch[index], id: link, link });
        }
    }
    if (!resolved.size) {
        if (!allowGoogleLinks) throw new Error('O Google Notícias não devolveu links diretos para artigos da Renascença');
        console.warn('Renascença: links diretos indisponíveis. A usar os links do Google Notícias no digest.');
        return makeFeed(candidates.slice(0, 10));
    }
    return makeFeed([...resolved.values()]);
}

async function getLatest(allowGoogleLinks) {
    try {
        const feed = await parse(feedUrl, { timeout: 8000 });
        const items = feed.items?.flatMap(item => {
            const link = articleUrl(item.link);
            return link && isValidArticle(item) ? [{ ...item, link }] : [];
        });
        if (items?.length) return { feed: { ...feed, items }, source: 'RSS oficial' };
        throw new Error('Nenhum artigo válido');
    } catch (error) {
        console.warn(`RSS da Renascença indisponível (${error.message}). A consultar /ultimas.`);
    }

    try {
        return { feed: await scrapeLatest(), source: '/ultimas' };
    } catch (error) {
        console.warn(`Página de últimas da Renascença indisponível (${error.message}). A consultar o Google Notícias.`);
    }
    return { feed: await readNewsFeed(allowGoogleLinks), source: 'Google Notícias' };
}

function isValidTitle(title) {
    if (typeof title !== 'string') return false;
    const trimmed = title.trim();
    return !/^(?:[-–—]\s*)?(?:Renascença)?$/iu.test(trimmed);
}

function isValidArticle({ title, link, published }) {
    return isValidTitle(title) && typeof link === 'string' &&
        /^https?:\/\//.test(link) && URL.canParse(link) &&
        Number.isFinite(published) && Number.isFinite(new Date(published).getTime());
}

async function writeJson(path, data, indentation) {
    const temporary = `${path}.${randomUUID()}.tmp`;
    try {
        await writeFile(temporary, JSON.stringify(data, null, indentation) + '\n');
        await rename(temporary, path);
    } finally {
        await rm(temporary, { force: true });
    }
}

async function main() {
    const digest = process.argv.includes('--digest');
    const { feed, source } = await getLatest(digest);
    if (digest) {
        const articles = feed.items.filter(isValidArticle)
            .sort((a, b) => b.published - a.published)
            .slice(0, 10)
            .map(item => ({
                title: item.title.trim(),
                url: item.link,
                date_published: new Date(item.published).toISOString(),
                media: 'Renascença',
            }));
        await writeJson('digest/latest--renascenca.json', articles, 2);
    }
    if (feed.items.every(item => articleUrl(item.link))) {
        await writeJson('renascenca.json', feed, 3);
    }
    console.log(`Renascença: ${feed.items.length} artigos recolhidos via ${source}.`);
}

main().catch(error => {
    console.error('Falha ao atualizar as notícias da Renascença:', error.message);
    process.exitCode = 1;
});
