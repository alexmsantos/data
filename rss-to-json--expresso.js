const { parse } = require('rss-to-json');
const fs = require('fs');
// async await
(async () => {

    var rss = await parse('https://rss.impresa.pt/feed/latest/expresso.rss');

    let jsonStringify = JSON.stringify(rss, null, 3);

    console.log(jsonStringify);

    fs.writeFile('expresso.json', jsonStringify, function(err){
      console.log('File successfully written');
    });

})();
