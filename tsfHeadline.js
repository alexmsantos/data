const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.tsf.pt';

puppeteer
  .launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Added no-sandbox flag
  })
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url).then(function() {
      // Wait for the dynamic content to load
      return page.waitForSelector('div.sk-container > div.sk-wrapper > div > div > a h2.title', 'div.sk-container > div.sk-wrapper > div > div > a.clean-link');
    })
    .then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);
    const articleTitle = $('div.sk-container > div.sk-wrapper > div > div > a h2.title');
    const articleUrl = $('div.sk-container > div.sk-wrapper > div > div > a.clean-link');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.first().text().trim(),
      url: 'https://www.tsf.pt' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "TSF"
    }));

    fs.writeFile('headlines/headline--tsf.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });

    console.log(jsonString);

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
