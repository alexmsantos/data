const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.noticiasaominuto.com';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('.carousel-item a .slide h1', html).eq(0);
    const articleUrl = $('.carousel-item a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Notícias ao Minuto"
    }));

    fs.writeFile('headlines/headline--noticiasaominuto.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
