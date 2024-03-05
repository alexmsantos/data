const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://rr.sapo.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('.column-group.bottom-space a h3.superFix', html).eq(0);
    const articleUrl = $('.column-group.bottom-space .all-100:last-child a');
    articles.push(articleTitle.text().trim());
    articles.push('https://rr.sapo.pt/' + articleUrl[0].attribs.href);
    let ms = new Date();
    const dateIso = ms.toISOString()
    articles.push(dateIso);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--renascenca.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
