const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://cnnportugal.iol.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('.manchetes .item .item-title', html).eq(0);
    const articleUrl = $('.manchetes .item > a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "CNN Portugal"
    }));

    fs.writeFile('headlines/headline--cnn.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
