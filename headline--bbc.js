const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.bbc.com/news';

puppeteer
  .launch({
    headless: "new",
  })
  .then(function(browser) {
    return browser.newPage();
  })
  .then(function(page) {
    // Define the user agent
    page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36');
    return page.goto(url, { timeout: 120000 }).then(function() {
      // Wait for the dynamic content to load
      return page.waitForSelector('main ul li a > span > p > span', 'main ul li a', { timeout: 60000 });
    })
    .then(function() {
      return page.content();
    });
  })
  .then(function(html) {
    const $ = cheerio.load(html);
    const articleTitle = $('main ul li a > span > p > span');
    const articleUrl = $('main ul li a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.first().text().trim(),
      url: 'https://www.bbc.com' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "BBC News",
    }));

    fs.writeFile('headlines-world/headline--bbc.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });
    
    console.log(jsonString);

  })
  .catch(function(err) {
    console.log(err);
    process.exit(1);
  });
