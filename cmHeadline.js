const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.cmjornal.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('.manchetes article.destaque .text_container a > h1', html).eq(0);
    const articleUrl = $('.manchetes article.destaque .text_container a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: 'https://www.cmjornal.pt' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Correio da Manhã"
    }));

    fs.writeFile('headlines/headline--cm.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
