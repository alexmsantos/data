const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://onovo.sapo.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('h1.uk-h1', html).eq(0);
    const articleUrl = $('h1.uk-h1 > a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Novo"
    }));

    fs.writeFile('headlines/headline--novo.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
