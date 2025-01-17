const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.dn.pt';

puppeteer
  .launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Added no-sandbox flag
  })
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url, { timeout: 90000 }).then(function() {
      // Wait for the dynamic content to load
      return page.waitForSelector('.headline-m_wrapper__3nUmh > a > h3.headline-m_headline__3_NhV', '.headline-m_wrapper__3nUmh > a', { timeout: 20000 });
    })
    .then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);

    const articleTitle = $('.headline-m_wrapper__3nUmh > a > h3.headline-m_headline__3_NhV');
    const articleUrl = $('.headline-m_wrapper__3nUmh > a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.first().text().trim(),
      url: 'https://www.dn.pt' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Diário de Notícias"
    }));

    fs.writeFile('headlines/headline--dn.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });

    console.log(jsonString);

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
