const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://observador.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('.editorial-grid .mod h1.title a', html).eq(0);
    const articleUrl = $('.editorial-grid .mod h1.title a');
    articles.push(articleTitle.text().trim());
    articles.push(articleUrl[0].attribs.href);
    let ms = new Date();
    const dateIso = ms.toISOString()
    articles.push(dateIso);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--observador.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
