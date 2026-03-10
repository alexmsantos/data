const { parse } = require('rss-to-json');
const fs = require('fs');
const path = require('path');

// async await
(async () => {
    try {
        console.log('Starting RSS fetch from https://rr.pt/rssfeed-ultimas');
        
        var rss = await parse('https://rr.pt/rssfeed-ultimas', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Referer': 'https://rr.pt/',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        let jsonStringify = JSON.stringify(rss, null, 3);

        console.log(jsonStringify);

        const filePath = path.join(__dirname, 'renascenca.json');
        fs.writeFile(filePath, jsonStringify, function(err){
            if (err) {
                console.error('Error writing file:', err);
                process.exit(1);
            }
            console.log('File successfully written to:', filePath);
        });
    } catch (error) {
        console.error('Error fetching RSS:', error.message);
        process.exit(1);
    }
})();
