const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');
const url = 'https://expresso.pt';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();

    const $ = cheerio.load(html);

    const articleTitle = $('.main-section .teaser-article .text-details > h2.title > a', html).eq(0);
    const articleUrl = $('.main-section .teaser-article .text-details > h2.title > a');
    let ms = new Date();
    const dateIso = ms.toISOString();

    const jsonString = JSON.stringify({
      title: articleTitle.text(),
      url: 'https://expresso.pt' + articleUrl[0].attribs.href,
      fetchDate: dateIso,
      media: "Expresso"
    });

    fs.writeFile('headlines/headline--expresso.json', jsonString, function(err) {
      if (err) throw err;
      console.log('File successfully written');
      process.exit(0);
    });

    console.log(jsonString);

  } catch (err) {
    console.log(err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
