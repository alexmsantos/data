const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://eco.sapo.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('article.highlight .highlight__content h2.title').eq(0);
    const articleUrl = $('article.highlight .highlight__content a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "ECO"
    }));

    fs.writeFile('headlines/headline--eco.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
