const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://eco.sapo.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    const articleTitle = $('article.highlight .highlight__content h2.title').eq(0);
    const articleUrl = $('article.highlight .highlight__content a');
    articles.push(articleTitle.text().trim());
    articles.push(articleUrl[0].attribs.href);
    let ms = new Date();
    const dateIso = ms.toISOString()
    articles.push(dateIso);
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('headline--eco.json', jsonString, function(err){
      console.log('File successfully written');
    });

  })
  .catch(function(err){
    console.log(err);
  });
