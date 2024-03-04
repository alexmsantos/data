const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.cmjornal.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('.manchetes_container article.destaque .text_container h1 > a', html).eq(0);
    const articleUrl = $('.manchetes_container article.destaque .text_container h1 > a');
    articles.push(articleTitle.text().trim());
    articles.push('https://www.cmjornal.pt' + articleUrl[0].attribs.href);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--cm.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
