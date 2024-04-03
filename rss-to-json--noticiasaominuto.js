const { parse } = require('rss-to-json');
const fs = require('fs');
// async await
(async () => {

    var rss = await parse('https://www.noticiasaominuto.com/rss/ultima-hora');

    let jsonStringify = JSON.stringify(rss, null, 3);

    console.log(jsonStringify);

    fs.writeFile('noticiasaominuto.json', jsonStringify, function(err){
      console.log('File successfully written');
    });

})();
