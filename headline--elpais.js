const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://elpais.com';

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
      return page.waitForSelector('main section article h2 > a', 'main section article h2 > a', { timeout: 20000 });
    })
    .then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);
    const articleTitle = $('main section article h2 > a');
    const articleUrl = $('main section article h2 > a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.first().text().trim(),
      url: articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "El País",
    }));

    fs.writeFile('headlines-world/headline--elpais.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });
    
    console.log(jsonString);

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
