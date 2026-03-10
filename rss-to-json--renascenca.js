const { parse } = require('rss-to-json');
const fs = require('fs');
const path = require('path');

// Retry function with exponential backoff
async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Fetching RSS (attempt ${attempt}/${maxRetries})...`);
            return await parse(url, options);
        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Exponential backoff: 2s, 4s, 8s
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// async await
(async () => {
    try {
        console.log('Starting RSS fetch from https://rr.pt/rssfeed-ultimas');
        
        var rss = await fetchWithRetry('https://rr.pt/rssfeed-ultimas', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Referer': 'https://rr.pt/',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
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
