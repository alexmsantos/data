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
      const toISOString = new Date(articleDate.attribs.datetime).toISOString();
      //articles.push(toISOString);

      function toIsoString(date) {
        var tzo = -date.getTimezoneOffset(),
            dif = tzo >= 0 ? '+' : '-',
            pad = function(num) {
                return (num < 10 ? '0' : '') + num;
            };
      
        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds()) +
            dif + pad(Math.floor(Math.abs(tzo) / 60)) +
            ':' + pad(Math.abs(tzo) % 60);
      }
      
      var dt = new Date(toISOString);
      //console.log(toIsoString(dt));
      
      articles.push(toIsoString(dt));
      
    }
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('eco.json', jsonString, function(err){
      console.log('File successfully written! - Check your project directory for the eco.json file');
    });

  })
  .catch(function(err){
    console.log(err);
  });
