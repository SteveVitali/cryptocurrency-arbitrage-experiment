import { Graph } from 'graphlib';
import getExchangeRates from './exchange-rates';
import bellmanFord from './bellman-ford';

getExchangeRates()
  .then(exchangeRates => {
    const graph = new Graph({ directed: true });

    Object.keys(exchangeRates).forEach(fromKey => {
      Object.keys(exchangeRates[fromKey]).forEach(toKey => {
        graph.setEdge(fromKey, toKey, exchangeRates[fromKey][toKey]);
      });
    });

    const vertices = graph.nodes();
    const edges = graph.edges().map(e => {
      return {
        u: e.v,
        v: e.w,
        w: graph.edge(e)
      };
    });
    const source = 'BTC';
    const { distance, predecessor } = bellmanFord(vertices, edges, source);
  })
  .catch(err => console.log(err));
