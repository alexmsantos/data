const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.rtp.pt/noticias/';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('.main-article h2.main-title', html).eq(0);
    const articleUrl = $('.main-article > a');
    articles.push(articleTitle.text().trim());
    articles.push(articleUrl[0].attribs.href.trim());
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--rtp.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
