const rp = require('request-promise');
const cheerio = require('cheerio');
//const url = 'https://eco.sapo.pt/ultimas/';

const ecoParse = function(url) {
  return rp(url)
    .then(function(html) {
      const $ = cheerio.load(html);
      return {
        title: $('.card__info > a > h3.card__title', html).text(),
      };
    })
    .catch(function(err) {
      console.log(err);
      
    });
};

module.exports = ecoParse;