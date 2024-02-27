const { parse } = require('rss-to-json');
const fs = require('fs');
// async await
(async () => {

    var rss = await parse('https://cnnportugal.iol.pt/rss.xml');

    let jsonStringify = JSON.stringify(rss, null, 3);

    console.log(jsonStringify);

    fs.writeFile('cnnportugal.json', jsonStringify, function(err){
      console.log('File successfully written! - Check your project directory for the cnnportugal.json file');
    });

})();
