import { Graph } from 'graphlib';
import getExchangeRates from './exchange-rates';

getExchangeRates()
  .then(exchangeRates => {
    const graph = new Graph({ directed: true });

    Object.keys(exchangeRates).forEach(fromKey => {
      Object.keys(exchangeRates[fromKey]).forEach(toKey => {
        graph.setEdge(fromKey, toKey, exchangeRates[fromKey][toKey]);
      });
    });
  })
  .catch(err => console.log(err));
