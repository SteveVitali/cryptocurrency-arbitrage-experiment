import fs from 'fs';
import request from 'request-promise';
import cheerio from 'cheerio';

const CRYPTONATOR_URL = 'https://www.cryptonator.com/rates/';
const HTML_CACHE_PATH = './exchange-rates/cryptonator-exchange-rates.html';
const JSON_CACHE_PATH = './exchange-rates/cryptonator-exchange-rates.json';

function loadHtml() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(HTML_CACHE_PATH)) {
      console.log('Loading local HTML from ' + HTML_CACHE_PATH);
      const html = fs.readFileSync(HTML_CACHE_PATH, 'utf8');
      return resolve(html);
    }
    console.log('Fetching HTML from ' + CRYPTONATOR_URL);
    request(CRYPTONATOR_URL)
      .then(html => {
        fs.writeFileSync(HTML_CACHE_PATH, html, 'utf8');
        resolve(html);
      })
      .catch(reject);
  });
}

export default function loadExchangeRates(done) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(JSON_CACHE_PATH)) {
      console.log('Loading local JSON from ' + JSON_CACHE_PATH);
      const json = fs.readFileSync(JSON_CACHE_PATH, 'utf8');
      return resolve(JSON.parse(json));
    }
    console.log('Extracting exchange rates from HTML...');
    const exchangeRatesMap = {};
    loadHtml()
      .then(html => {
        let $ = cheerio.load(html);
        const mainDiv = $('div.col-sm-8.col-sm-offset-2');
        mainDiv.children().each(function(i, table) {
          if (table.tagName !== 'table') return;
          $(table).find('tr.pairRow').each(function(i, tr) {
            const tds = $(tr).children();
            const fromCurrency = $(tds[0]).find('a').text().trim();
            const toCurrency = $(tds[1]).find('a').text().trim();
            const exchangeRate = Number($(tds[2]).find('a').text());
            exchangeRatesMap[fromCurrency] = exchangeRatesMap[fromCurrency] || {};
            exchangeRatesMap[fromCurrency][toCurrency] = exchangeRate;
          });
        });
        console.log('Writing the exchange rates map JSON to ' + JSON_CACHE_PATH);
        fs.writeFileSync(JSON_CACHE_PATH, JSON.stringify(exchangeRatesMap, 'utf8'));
        return resolve(exchangeRatesMap);
      })
      .catch(reject);
  });
}
