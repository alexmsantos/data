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
    const articles = [];
    const articleTitle = $('#destaques h2.title');
    const articleUrl = $('#destaques a.clean-link');
    articles.push(articleTitle.first().text().trim());
    articles.push('https://www.jn.pt' + articleUrl[0].attribs.href);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--jn.json', jsonString, function(err){
      console.log('File successfully written');
      // Exit the process after the file is written
      process.exit(0);
    });

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
