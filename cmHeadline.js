const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.cmjornal.pt';

puppeteer
  .launch()
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url, { timeout: 90000 }).then(function() {
      // Wait for the dynamic content to load
      return page.waitForSelector('article.destaque .text_container a:nth-of-type(2) > h2', 'article.destaque .text_container a:nth-of-type(2)', { timeout: 20000 });
    })
    .then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);
    const articleTitle = $('article.destaque .text_container a:nth-of-type(2) > h2');
    const articleUrl = $('article.destaque .text_container a:nth-of-type(2)');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.first().text().trim(),
      url: 'https://www.cmjornal.pt' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Correio da Manhã",
    }));

    fs.writeFile('headlines/headline--cm.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });
    
    console.log(jsonString);

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });