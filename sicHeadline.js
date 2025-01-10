const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://sicnoticias.pt';

puppeteer
  .launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Added no-sandbox flag
  })
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url).then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);
    const articleTitle = $('.main-section .teaser-article .text-details > h2.title > a', html).eq(0);
    const articleUrl = $('.main-section .teaser-article .text-details > h2.title > a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text(),
      url: 'https://sicnoticias.pt' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "SIC Notícias"
    }));

    fs.writeFile('headlines/headline--sicnoticias.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });

    console.log(jsonString);

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
