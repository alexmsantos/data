const rp = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://eco.sapo.pt/ultimas/';

rp(url)
  .then(function(html){
    //success!
    //console.log(html);
    const $ = cheerio.load(html);
    //console.log($('.link-cover', html).length);
    //console.log($('h3.card__title', html).prop('innerText'));
    const articles = [];
    for (let i = 0; i < 12; i++) {
      const articleTitle = $('.card__info > a > h3.card__title').eq(i);
      const articleUrl = $('.card__info > a', html)[i];
      const articleDate = $('.meta__time > time', html)[i];
      articles.push(articleTitle.text());
      articles.push(articleUrl.attribs.href);
      articles.push(articleDate.attribs.datetime);
    }
    console.log(articles);
    /*
    const jsonData = JSON.parse(articles);
    jsonData.users.push({
        name: "James Den",
        email: "james.den@example.com"
    });
    */
    fs.writeFile('eco.json', JSON.stringify(articles, null, 2), function(err){
      console.log('File successfully written! - Check your project directory for the articles.json file');
    });
  })
  .catch(function(err){
    console.log(err);
  });