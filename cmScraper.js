const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.cmjornal.pt/cm-ao-minuto';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    for (let i = 0; i < 10; i++) {
      const articleTitle = $('.aominutoMain h2 > a').eq(i);
      const articleUrl = $('.aominutoMain h2 > a', html)[i];
      const articleDate = $('.aominutoMain .dateTime', html).eq(i);
      articles.push(articleTitle.text().trim());
      articles.push("https://www.cmjornal.pt" + articleUrl.attribs.href);
      const dateTrim = articleDate.text().trim();
      let thisYear = new Date();
      let dateArray = dateTrim.split(/[|,/, ]/);
      let newDate = `${thisYear.getFullYear()}-${dateArray[4]}-${dateArray[3]}T${dateArray[0]}:00.000Z`;
      articles.push(newDate);
    }
    console.log(articles);

    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('cm.json', jsonString, function(err){
      console.log('File successfully written! - Check your project directory for the cm.json file');
    });

  })
  .catch(function(err){
    console.log(err);
  });