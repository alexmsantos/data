const { parse } = require('rss-to-json');
const fs = require('fs');
// async await
(async () => {

    var rss = await parse('https://www.ine.pt/ine/rssfeed_dst.jsp?lang=PT');

    let jsonStringify = JSON.stringify(rss, null, 3);

    console.log(jsonStringify);

    fs.writeFile('ine-destaques.json', jsonStringify, function(err){
      console.log('File successfully written');
    });

})();
