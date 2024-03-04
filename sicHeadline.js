const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://sicnoticias.pt';

puppeteer
  .launch()
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
    const articles = [];
    const articleTitle = $('.main-section .teaser-article .text-details > h2.title > a', html).eq(0);
    const articleUrl = $('.main-section .teaser-article .text-details > h2.title > a');
    articles.push(articleTitle.text());
    articles.push('https://sicnoticias.pt' + articleUrl[0].attribs.href);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--sicnoticias.json', jsonString, function(err){
      console.log('File successfully written');
      // Exit the process after the file is written
      process.exit(0);
    });

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
