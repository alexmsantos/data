const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://eco.sapo.pt/ultimas/';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    for (let i = 0; i < 12; i++) {
      const articleTitle = $('.card__info > a > h3.card__title').eq(i);
      const articleUrl = $('.card__info > a', html)[i];
      const articleDate = $('.meta__time > time', html)[i];
      articles.push(articleTitle.text());
      articles.push(articleUrl.attribs.href);
      articles.push(articleDate.attribs.datetime);
    }
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('eco.json', jsonString, function(err){
      console.log('File successfully written! - Check your project directory for the articles.json file');
    });

  })
  .catch(function(err){
    console.log(err);
  });