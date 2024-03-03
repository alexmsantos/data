const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://onovo.sapo.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('h1.uk-h1', html).eq(0);
    const articleUrl = $('h1.uk-h1 > a');
    articles.push(articleTitle.text().trim());
    articles.push(articleUrl[0].attribs.href);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--novo.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
