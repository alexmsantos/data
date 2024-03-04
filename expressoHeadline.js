const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://expresso.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('.main-section .teaser-article .text-details > h2.title > a', html).eq(0);
    //const articleUrl = $('.main-section .teaser-article .text-details > h2.title > a');
    articles.push(articleTitle.text());
    //articles.push(articleUrl[0].attribs.href);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--expresso.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
