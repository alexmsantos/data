const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.rtp.pt/noticias/';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('.main-article .main-title', html).eq(0);
    const articleUrl = $('.main-article > a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: articleUrl[0].attribs.href.trim(),
      fetchDate: dateIso,
      media: "RTP Notícias"
    }));

    fs.writeFile('headlines/headline--rtp.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
