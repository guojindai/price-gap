const fs = require('fs');
const path = require('path');
const request = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');

const RE_PRICE = /([0-9,]+)/;
const RE_ALL_COMMA = /,/g;
const ROBOT = 'https://oapi.dingtalk.com/robot/send?access_token=d59cd7c674f275bfd984e44395077af98ccd6b9f77f55d30cd26bfed7f1b302f';

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

async function getInPrices() {
  const inPrices = {};
  const resBody = await request('https://otcbtc.com/');
  const $ = cheerio.load(resBody);
  const $trs = $('.lp-section-2-coin').eq(0).find('tr');
  inPrices.BTC = formatPrice($trs.eq(1).find('td').eq(2).text());
  inPrices.ETH = formatPrice($trs.eq(2).find('td').eq(2).text());
  inPrices.EOS = formatPrice($trs.eq(3).find('td').eq(2).text());
  return inPrices;
}

async function getBTCOutPrice() {
  const resBody = await request('https://otcbtc.com/sell_offers?currency=btc&fiat_currency=cny&payment_type=all');
  const $ = cheerio.load(resBody);
  return formatPrice($('.long-solution-list .list-content').eq(0).find('.price').text());
}

async function getETHOutPrice() {
  const resBody = await request('https://otcbtc.com/sell_offers?currency=eth&fiat_currency=cny&payment_type=all');
  const $ = cheerio.load(resBody);
  return formatPrice($('.long-solution-list .list-content').eq(0).find('.price').text());
}

async function getEOSOutPrice() {
  const resBody = await request('https://otcbtc.com/sell_offers?currency=eos&fiat_currency=cny&payment_type=all');
  const $ = cheerio.load(resBody);
  return formatPrice($('.long-solution-list .list-content').eq(0).find('.price').text());
}

async function getData() {
  const inPrices = await getInPrices();
  const btcOutPrice = await getBTCOutPrice();
  const ethOutPrice = await getETHOutPrice();
  const eosOutPrice = await getEOSOutPrice();
  return {
    inPrices,
    btcOutPrice,
    ethOutPrice,
    eosOutPrice,
  };
}

function robotMsg(inPrice, outPrice) {
  return `${inPrice}, ${outPrice}, ${parseInt((outPrice - inPrice) * 100 / inPrice)}`;
}

function logError(msg) {
  fs.appendFileSync(path.resolve(dataDir, 'data.log'), `${msg}\n`);
}

getData().then((data) => {
  const now = getNowTimeString();
  fs.appendFileSync(path.resolve(dataDir, 'BTC.csv'), `${now},${data.inPrices.BTC},${data.btcOutPrice}\n`);
  fs.appendFileSync(path.resolve(dataDir, 'ETH.csv'), `${now},${data.inPrices.ETH},${data.ethOutPrice}\n`);
  fs.appendFileSync(path.resolve(dataDir, 'EOS.csv'), `${now},${data.inPrices.EOS},${data.eosOutPrice}\n`);
  const msg =
`
### GAP
> A: ${robotMsg(data.inPrices.BTC, data.btcOutPrice)}\n
> B: ${robotMsg(data.inPrices.ETH, data.ethOutPrice)}\n
> C: ${robotMsg(data.inPrices.EOS, data.eosOutPrice)}\n
`;
  request({
    method: 'POST',
    uri: ROBOT,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      msgtype: 'markdown',
      markdown: {
        title: 'GAP',
        text: msg
      }
    })
  }).catch((err) => {
    logError(`${getNowTimeString()}, ${JSON.stringify(err)}`);
  });
}).catch((err) => {
  console.log(err);
  logError(`${getNowTimeString()}, ${JSON.stringify(err)}, ${err}`);
});
