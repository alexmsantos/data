const puppeteer = require('puppeteer');
const fs = require('fs');
const url = 'https://www.cmjornal.pt/cm-ao-minuto';

(async () => {
  try {
    // Launch a new browser instance
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Create a new page instance
    const page = await browser.newPage();

    // Navigate to the target URL
    await page.goto(url);

    // Wait for the page to load
    await page.waitForSelector('.bloco_noticia');

    // Extract article data
    const articles = await page.evaluate(() => {
      const articleElements = document.querySelectorAll('.bloco_noticia');
      const articles = [];

      articleElements.forEach((element, index) => {
        try {
          const articleTitle = element.querySelector('a.destaque_titulo > h2');
          const articleUrl = element.querySelector('a.destaque_titulo');
          const articleDate = element.querySelector('.date_noticia');

          if (!articleTitle || !articleUrl || !articleDate) {
            console.log(`Error: Unable to retrieve article data for index ${index}`);
            return;
          }

          const title = articleTitle.textContent.trim();
          const url = articleUrl.href.startsWith("https://") ? articleUrl.href : `https://www.cmjornal.pt${articleUrl.href}`;
          const date = articleDate.textContent.trim();
          const thisYear = new Date();
          const dateArray = date.split(/[|,/, ]/);
          const newDate = `${thisYear.getFullYear()}-${dateArray[1]}-${dateArray[0]}T${dateArray[2]}:00+00:00`;

          articles.push({ title, url, date: newDate });
        } catch (error) {
          console.log(`Error: ${error.message}`);
        }
      });

      return articles;
    });

    // Close the browser instance
    await browser.close();

    // Write the article data to a JSON file
    const jsonString = JSON.stringify(Object.assign({}, articles))
    fs.writeFile('cm.json', jsonString, function(err){
      if (err) {
        console.log(`Error: ${err.message}`);
      } else {
        console.log('File successfully written! - Check your project directory for the cm.json file');
      }
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
})();