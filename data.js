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

async function getPrices() {
  const prices = {
    inPrices: {},
    outPrices: {},
  };
  let resBody = await request('https://otc-api.huobi.pro/v1/data/trade/list/public?country=37&currency=1&payMethod=0&currPage=1&coinId=2&tradeType=1&merchant=1&online=1');
  resBody = JSON.parse(resBody);
  prices.outPrices.BTC = resBody.data[0].fixedPrice;
  resBody = await request('http://apilayer.net/api/live?access_key=29f539138de93b867c43f988068a40b5&currencies=CNY&format=1');
  resBody = JSON.parse(resBody);
  prices.inPrices.BTC = resBody.quotes.USDCNY;
  return prices;
}

async function getData() {
  const prices = await getPrices();
  return prices;
}

function robotMsg(inPrice, outPrice) {
  return `${inPrice}, ${outPrice}, ${parseInt((outPrice - inPrice) * 100 / inPrice)}`;
}

function logError(msg) {
  fs.appendFileSync(path.resolve(dataDir, 'data.log'), `${msg}\n`);
}

getData().then((prices) => {
  const now = getNowTimeString();
  fs.appendFileSync(path.resolve(dataDir, 'BTC.csv'), `${now},${prices.inPrices.BTC},${prices.outPrices.BTC}\n`);
  const msg =
`
### GAP
> A: ${robotMsg(prices.inPrices.BTC, prices.outPrices.BTC)}\n
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
    logError(`${getNowTimeString()}, ${err}`);
  });
}).catch((err) => {
  console.error(err);
  logError(`${getNowTimeString()}, ${err}`);
});
