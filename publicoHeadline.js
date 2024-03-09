const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.publico.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('.article  .article__title a', html).eq(0);
    const articleUrl = $('.article  .article__title a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: 'https://www.publico.pt' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Público"
    }));

    fs.writeFile('headlines/headline--publico.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
