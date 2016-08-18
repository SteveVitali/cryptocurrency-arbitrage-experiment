import request from 'request-promise';
import shapeShiftCoins from './shape-shift-coins'

// 1. Convert array of coins into all-pairs array
export default function getShapeShiftExchangeRates() {
  return shapeShiftCoins.reduce((acc, coinA) => {
    return acc.concat(
      shapeShiftCoins.map(coinB => [coinA, coinB])
    );
  }, [])
  // 2. Map each string to a promise executing an exchange rate request
  .map(([a, b]) => {
    return new Promise((resolve, reject) => {
      const pair = `${a}_${b}`;
      if (a === b) {
        return resolve({ [pair]: 1 });
      }
      request({ uri: 'https://shapeshift.io/rate/' + pair })
        .then(res => {
          res = JSON.parse(res);
          res.error
            ? console.log(Object.assign(res, { pair }))
            : console.log(res);

          resolve(res.error ? {} : { [a]: { [b]: res.rate } });
        })
        .catch(reject);
    });
  })
  // 3. Reduce all of these into a single promise that executes all requests
  //    and resolves to an object mapping coin pair to coin pairs to rates
  .reduce((acc, doRateRequest) => {
    return acc.then(data => {
      return doRateRequest.then(moreData => {
        Object.keys(moreData).forEach(a => {
          Object.keys(moreData[a]).forEach(b => {
            data[a] = data[a] || {};
            data[a][b] = Number(moreData[a][b]);
          });
        });
        return data;
      });
    });
  }, new Promise((resolve, _) => resolve({})));
}
