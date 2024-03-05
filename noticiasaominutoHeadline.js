const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.noticiasaominuto.com';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('.main-carousel-item-container a .main-carousel-item-headline p', html).eq(0);
    const articleUrl = $('.main-carousel-item-container a');
    articles.push(articleTitle.text().trim());
    articles.push(articleUrl[0].attribs.href);
    let ms = new Date();
    const dateIso = ms.toISOString()
    articles.push(dateIso);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--noticiasaominuto.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
