const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://jornaleconomico.sapo.pt/';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('h1.uk-h1 > a', html).eq(0);
    const articleUrl = $('h1.uk-h1 > a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Económico"
    }));

    fs.writeFile('headlines/headline--economico.json', jsonString, function(err){
      console.log('File successfully written');
    });

   console.log(jsonString);
   
  })
  .catch(function(err){
    console.log(err);
  });
