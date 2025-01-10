const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.folha.uol.com.br';

puppeteer
  .launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Added no-sandbox flag
  })
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url, { timeout: 120000 }).then(function() {
      // Wait for the dynamic content to load
      return page.waitForSelector('.c-main-headline__url > .c-main-headline__title', '.c-main-headline__url', { timeout: 60000 });
    })
    .then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);
    const articleTitle = $('.c-main-headline__url > .c-main-headline__title');
    const articleUrl = $('.c-main-headline__url');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.first().text().trim(),
      url: articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Folha de S.Paulo",
    }));

    fs.writeFile('headlines-world/headline--folha.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });
    
    console.log(jsonString);

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
