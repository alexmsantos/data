const axios = require('axios');
const Parser = require('rss-to-json');
const fs = require('fs');

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const instance = axios.create({
  headers: {
    'User-Agent': userAgent
  },
  timeout: 10000
});
// async await
(async () => {

    var rss = await Parser.parse('https://rr.pt/rssfeed-ultimas', {
        headers: {
            'User-Agent': userAgent
        }
    });

    let jsonStringify = JSON.stringify(rss, null, 3);

    console.log(jsonStringify);

    fs.writeFile('renascenca.json', jsonStringify, function(err){
      console.log('File successfully written');
    });

})();
