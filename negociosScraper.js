const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://www.jornaldenegocios.pt/noticias-no-minuto';

rp(url)
  .then(function(html){
    const $ = cheerio.load(html);

    const articles = [];
    for (let i = 0; i < 10; i++) {
      const articleTitle = $('.listagem_destaques article.destaque > .text_container a:first-child').eq(i);
      //const articleUrl = $('listagem_destaques article.destaque > .text_container a:first-child', html)[i];
      const articleDate = $('.listagem_destaques article.destaque > .text_container .data_autor > .time').eq(i);
      //articles.push(articleTitle.text());
      //articles.push(articleUrl.attr('href'));
      const dateTrim = articleDate.text().trim();
      let thisYear = new Date();
      let newDate = `${thisYear.getFullYear()}-${thisYear.getMonth() + 1}-${thisYear.getDate()}T${dateTrim}:00.000Z`;
      articles.push(newDate);
      
    }
    console.log(articles);
/*
    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('negocios2.json', jsonString, function(err){
      console.log('File successfully written! - Check your project directory for the negocios2.json file');
    });
*/
  })
  .catch(function(err){
    console.log(err);
  });