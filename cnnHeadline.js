const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://cnnportugal.iol.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('.manchetes .item .item-title', html).eq(0);
    const articleUrl = $('.manchetes .item > a');
    articles.push(articleTitle.text().trim());
    articles.push(articleUrl[0].attribs.href);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--cnn.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
