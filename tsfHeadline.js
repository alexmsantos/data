const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.tsf.pt';

puppeteer
  .launch()
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    return page.goto(url).then(function() {
      // Wait for the dynamic content to load
      return page.waitForSelector('.component-root h2.title', '.component-root a.clean-link');
    })
    .then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);
    const articles = [];
    const articleTitle = $('.component-root h2.title');
    const articleUrl = $('.component-root a.clean-link');
    articles.push(articleTitle.first().text().trim());
    articles.push('https://www.tsf.pt' + articleUrl[0].attribs.href);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--tsf.json', jsonString, function(err){
      console.log('File successfully written');
      // Exit the process after the file is written
      process.exit(0);
    });

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
