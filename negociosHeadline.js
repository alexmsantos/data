const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.jornaldenegocios.pt';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('article.destaque h1 > a');
    const articleUrl = $('article.destaque h1 > a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle[0].attribs.title,
      url: 'https://www.jornaldenegocios.pt' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Negócios"
    }));

    fs.writeFile('headlines/headline--negocios.json', jsonString, function(err){
      console.log('File successfully written');
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });
