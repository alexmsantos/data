const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://eco.sapo.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('article.highlight .highlight__content a:last-of-type');
    const articleUrl = $('article.highlight .highlight__content a');
    articles.push(articleTitle[0].attribs.title);
    articles.push(articleUrl[0].attribs.href);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--eco.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
