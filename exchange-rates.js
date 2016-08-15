import fs from 'fs';
import request from 'request';
import cheerio from 'cheerio';

const CRYPTONATOR_URL = 'https://www.cryptonator.com/rates/';
const HTML_CACHE_PATH = './exchange-rates.html';
const JSON_CACHE_PATH = './exchange-rates.json';

function loadHtml() {
  if (fs.existsSync(HTML_CACHE_PATH)) {
    console.log('Loading local HTML from ' + HTML_CACHE_PATH);
    return fs.readFileSync(HTML_CACHE_PATH, 'utf8');
  }
  console.log('Fetching HTML from ' + CRYPTONATOR_URL);
  request(CRYPTONATOR_URL, (err, response, body) => {
    if (err) return console.log(err);
    fs.writeFileSync(HTML_CACHE_PATH, body, 'utf8');
    return body;
  });
}

export default function loadExchangeRates() {
  if (fs.existsSync(JSON_CACHE_PATH)) {
    console.log('Loading local JSON from ' + JSON_CACHE_PATH);
    return JSON.parse(fs.readFileSync(JSON_CACHE_PATH, 'utf8'));
  }
  console.log('Extracting exchange rates from HTML...');
  const exchangeRatesMap = {};
  let $ = cheerio.load(loadHtml());
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
  fs.writeFileSync(JSON_CACHE_PATH, JSON.stringify(exchangeRatesMap, 'utf8'));
  return exchangeRatesMap;
}
