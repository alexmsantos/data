const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://rr.sapo.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('.column-group.bottom-space a h3.superFix', html).eq(0);
    const articleUrl = $('.column-group.bottom-space .all-100:last-child a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: 'https://rr.sapo.pt/' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Renascença"
    }));

    fs.writeFile('headlines/headline--renascenca.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
