import { Graph } from 'graphlib';
import { getShapeShiftExchangeRates, getCryptonatorExchangeRates } from './exchange-rates';
import computeNegativeCycles from './bellman-ford';

getExchangeRates()
  .then(exchangeRates => {
    const graph = new Graph({ directed: true });

    Object.keys(exchangeRates).forEach(fromKey => {
      Object.keys(exchangeRates[fromKey]).forEach(toKey => {
        graph.setEdge(fromKey, toKey, exchangeRates[fromKey][toKey]);
        graph.setEdge(toKey, fromKey, 1 / exchangeRates[fromKey][toKey]);
      });
    });

    const vertices = graph.nodes();
    const edges = graph.edges().map(e => {
      return {
        u: e.v,
        v: e.w,
        w: -Math.log(graph.edge(e))
      };
    });
    console.log('edges', edges);
    const source = 'USD';
    const negativeCycles = computeNegativeCycles(vertices, edges, source);
    negativeCycles.forEach(cycle => {
      let amount = 0.01;
      let str = '[ 1 ' + cycle[0];
      let deets = '{';
      for (let i = 0; i < cycle.length - 1; i++) {
        const edge = {
          v: cycle[i],
          w: cycle[i + 1]
        };
        let weight = graph.edge(edge);
        if (edge.v === edge.w) weight = 1;
        deets += ' 1 ' + edge.v + '=' + weight + ' ' + edge.w + ', ';
        amount = amount * weight;
        if (weight === undefined) return;
        str += ' --> ' + amount + ' ' + edge.w;
      }
      deets += '}';
      str += ' ]';
      if (amount > 1) {
        console.log();
        console.log(deets);
        console.log(str);
      }
    });
  })
  .catch(err => console.log(err));
