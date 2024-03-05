const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://ionline.sapo.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('#primeiramanchete .title h1 a', html).eq(0);
    const articleUrl = $('#primeiramanchete .title h1 a');
    articles.push(articleTitle.text().trim());
    articles.push('https://ionline.sapo.pt' + articleUrl[0].attribs.href);
    let ms = new Date();
    const dateIso = ms.toISOString()
    articles.push(dateIso);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--jornali.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
