const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.cmjornal.pt/cm-ao-minuto';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    for (let i = 0; i < 8; i++) {
      const articleTitle = $('.bloco_noticia a.destaque_titulo > h2').eq(i);
      const articleUrl = $('.bloco_noticia a.destaque_titulo', html)[i];
      const articleDate = $('.bloco_noticia .date_noticia', html).eq(i);
      articles.push(articleTitle.text().trim());
      if (!articleUrl.attribs.href.startsWith("https://")) {
        articles.push("https://www.cmjornal.pt" + articleUrl.attribs.href);
      } else {
        articles.push(articleUrl.attribs.href);
      }
      const dateTrim = articleDate.text().trim();
      let thisYear = new Date();
      let dateArray = dateTrim.split(/[|,/, ]/);
      let newDate = `${thisYear.getFullYear()}-${dateArray[1]}-${dateArray[0]}T${dateArray[2]}:00+00:00`;
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