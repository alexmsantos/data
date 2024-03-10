const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.bbc.com/news';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articleTitle = $('main ul li a > span > p > span').eq(0);
    const articleUrl = $('main ul li a');
    let ms = new Date();
    const dateIso = ms.toISOString()

    const jsonString = JSON.stringify(Object.assign({}, {
      title: articleTitle.text().trim(),
      url: 'https://www.bbc.com' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "BBC News",
    }));

    fs.writeFile('headlines-world/headline--bbc.json', jsonString, function(err){
      console.log('File successfully written');
      process.exit(0);
    });

    console.log(jsonString);

  })
  .catch(function(err){
    console.log(err);
  });