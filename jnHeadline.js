const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.jn.pt';

puppeteer
  .launch()
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url).then(function() {
      // Wait for the dynamic content to load
      return page.waitForSelector('#destaques h2.title', '#destaques a.clean-link');
    })
    .then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);
    const articleTitle = $('#destaques h2.title');
    const articleUrl = $('#destaques a.clean-link');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.first().text().trim(),
      url: 'https://www.jn.pt' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Jornal de Notícias"
    }));

    fs.writeFile('headlines/headline--jn.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
