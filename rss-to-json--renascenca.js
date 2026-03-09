const axios = require('axios');
const Parser = require('rss-to-json');
const fs = require('fs');

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const instance = axios.create({
  headers: {
    'User-Agent': userAgent,
    'Referer': 'https://www.google.com/',
    'Accept-Language': 'en-US,en;q=0.9',
  },
  timeout: 15000
});

// async await
(async () => {
  let retries = 3;
  let lastError;
  
  while (retries > 0) {
    try {
      console.log(`Attempting to fetch RSS feed (${retries} retries remaining)...`);
      
      var rss = await Parser.parse('https://rr.pt/rssfeed-ultimas', {
        headers: {
          'User-Agent': userAgent,
          'Referer': 'https://www.google.com/',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 15000
      });

      let jsonStringify = JSON.stringify(rss, null, 3);
      console.log(jsonStringify);

      fs.writeFile('renascenca.json', jsonStringify, function(err){
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log('File successfully written');
        }
      });
      
      break; // Success, exit retry loop
      
    } catch (error) {
      lastError = error;
      retries--;
      
      if (retries > 0) {
        const delay = (4 - retries) * 5000; // 5s, 10s, 15s delays
        console.error(`Failed to fetch. Retrying in ${delay/1000}s...`);
        console.error(`Error: ${error.response?.status || error.code || error.message}`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('All retries exhausted. Failed to fetch RSS feed.');
        console.error(`Final error: ${lastError.response?.status || lastError.code || lastError.message}`);
        process.exit(1);
      }
    }
  }

})();
