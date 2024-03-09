const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://edition.cnn.com';

puppeteer
  .launch()
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url, { timeout: 90000 }).then(function() {
      // Wait for the dynamic content to load
      return page.waitForSelector('.container_lead-package__cards-wrapper .container__headline-text', '.container_lead-package__cards-wrapper a.container_lead-package__link', { timeout: 60000 });
    })
    .then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);
    const articleTitle = $('.container_lead-package__cards-wrapper .container__headline-text');
    const articleUrl = $('.container_lead-package__cards-wrapper a.container_lead-package__link');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.first().text().trim(),
      url: 'https://edition.cnn.com' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "CNN",
    }));

    fs.writeFile('headlines-world/headline--cnn.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });
    
    console.log(jsonString);

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
