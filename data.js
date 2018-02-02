const fs = require('fs');
const path = require('path');
const request = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');

const RE_PRICE = /([0-9,]+)/;
const RE_ALL_COMMA = /,/g;

const dataDir = path.resolve(__dirname, './data');
if (!fs.existsSync(dataDir)){
  fs.mkdirSync(dataDir);
}

function throwNotNumberError(val) {
  throw new Error(`throwNotNumberError: ${val} is not a integer number`);
}

function formatPrice(val) {
  const found = val.match(RE_PRICE);
  if (found) {
    const intVal = parseInt(found[0].replace(RE_ALL_COMMA, ''));
    if (intVal > 0) {
      return intVal;
    } else {
      throwNotNumberError(val);
    }
  } else {
    throwNotNumberError(val);
  }
}

function getNowTimeString() {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

async function getPrices() {
  const prices = {
    inPrices: {},
    outPrices: {},
  };
  const resBody = await request('https://otcbtc.com/');
  const $ = cheerio.load(resBody);
  const $trs = $('.lp-section-2-coin').eq(0).find('.lp-coin-list-content');
  prices.outPrices.BTC = formatPrice($trs.eq(0).find('.lp-coin-list-fiat-highest-price').text());
  prices.inPrices.BTC = formatPrice($trs.eq(0).find('.lp-coin-list-trading-latest-price .lp-coin-list-trading-fiat-price').text());
  // prices.outPrices.ETH = formatPrice($trs.eq(1).find('.lp-coin-list-fiat-highest-price').text());
  // prices.inPrices.ETH = formatPrice($trs.eq(1).find('.lp-coin-list-trading-latest-price .lp-coin-list-trading-fiat-price').text());
  prices.outPrices.EOS = formatPrice($trs.eq(2).find('.lp-coin-list-fiat-highest-price').text());
  prices.inPrices.EOS = formatPrice($trs.eq(2).find('.lp-coin-list-trading-latest-price .lp-coin-list-trading-fiat-price').text());
  return prices;
}

async function getData() {
  const prices = await getPrices();
  return prices;
}

getData().then((prices) => {
  const now = getNowTimeString();
  fs.appendFileSync(path.resolve(dataDir, 'BTC.csv'), `${now},${prices.inPrices.BTC},${prices.outPrices.BTC}\n`);
  // fs.appendFileSync(path.resolve(dataDir, 'ETH.csv'), `${now},${prices.inPrices.ETH},${prices.outPrices.ETH}\n`);
  fs.appendFileSync(path.resolve(dataDir, 'EOS.csv'), `${now},${prices.inPrices.EOS},${prices.outPrices.EOS}\n`);
}).catch((err) => {
  console.error(err);
  fs.appendFileSync(path.resolve(dataDir, 'data.log'), `${getNowTimeString()}, ${err}`);
});
