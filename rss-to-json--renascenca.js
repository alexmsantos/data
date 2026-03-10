const { parse } = require('rss-to-json');
const fs = require('fs');
const path = require('path');

// async await
(async () => {
    try {
        console.log('Starting RSS fetch from https://rr.pt/rssfeed-ultimas');
        
        var rss = await parse('https://rr.pt/rssfeed-ultimas', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; DataScraper/1.0)'
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
