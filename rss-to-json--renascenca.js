const axios = require('axios');
const Parser = require('rss-to-json');
const fs = require('fs');

const instance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  timeout: 10000
});
// async await
(async () => {

    var rss = await parse('https://rr.pt/rssfeed-ultimas', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; DataScraper/1.0)'
        }
    });

    let jsonStringify = JSON.stringify(rss, null, 3);

    console.log(jsonStringify);

    fs.writeFile('renascenca.json', jsonStringify, function(err){
      console.log('File successfully written');
    });

})();
