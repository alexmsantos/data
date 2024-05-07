const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://ionline.sapo.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('.manchete .title h1 a', html).eq(0);
    const articleUrl = $('.manchete .title h1 a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Jornal i"
    }));

    fs.writeFile('headlines/headline--jornali.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
