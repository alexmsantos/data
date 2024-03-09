const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://observador.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('.editorial-grid .mod h1.title a', html).eq(0);
    const articleUrl = $('.editorial-grid .mod h1.title a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Observador"
    }));

    fs.writeFile('headlines/headline--observador.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
