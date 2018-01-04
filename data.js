const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const dataDir = path.resolve(__dirname, './data');
if (!fs.existsSync(dataDir)){
  fs.mkdirSync(dataDir);
}

async function getData() {
  const resBody = await request('http://www.baidu.com');
  fs.appendFileSync(path.resolve(dataDir, 'd1.csv'), resBody);
  return resBody;
}

getData().then((data) => {
  console.log(data);
}).catch((err) => {
  console.error(err);
});
