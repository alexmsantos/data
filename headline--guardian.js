const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.theguardian.com/international';

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
      return page.waitForSelector('#container-headlines > ul > li .show-underline', '#container-headlines > ul > li a', { timeout: 20000 });
    })
    .then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);
    const articleTitle = $('#container-headlines > ul > li .show-underline');
    const articleUrl = $('#container-headlines > ul > li a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.first().text().trim(),
      url: 'https://www.theguardian.com' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "The Guardian",
    }));

    fs.writeFile('headlines-world/headline--guardian.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });
    
    console.log(jsonString);

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
