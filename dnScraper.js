const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const url = 'https://www.dn.pt/ultimas/';

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
    console.log(html);
  })
  .catch(function(err) {
    console.log('there is an error: ' + err);
  });
