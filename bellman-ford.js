/**
 * Bellman-Ford algorithm
 * @param  {Array}  vertices Vertices
 * @param  {Array}  edges    Edges, with properties u, v, and w for weight
 * @param  {String} source   Source node
 * @return {Object}          Distance and predecessor maps
 */
export default function computeNegativeCycles(vertices = [], edges = [], source) {
  // Step 1: initialize graph
  const distance = {};
  const predecessor = {};
  vertices.forEach(v => {
    distance[v] = Infinity;
    predecessor[v] = null;
  });

  distance[source] = 0;

  // Step 2: relax all edges |V|-1 times
  for (let i = 1; i <= vertices.length - 1; i++) {
    edges.forEach(({ u, v, w }) => {
      if (distance[u] + w < distance[v]) {
        distance[v] = distance[u] + w;
        predecessor[v] = u;
      }
    });
  }

  const cycles = [];
  const nodesAlreadyInCycle = {};

  // Step 3: check for negative-weight cycles
  edges.forEach(({ u, v, w }) => {
    if (distance[u] + w < distance[v]) {
      const cycle = [u, v];
      nodesAlreadyInCycle[u] = true;
      nodesAlreadyInCycle[v] = true;
      let curr = predecessor[u];
      while (!nodesAlreadyInCycle[curr] && curr !== source) {
        cycle.unshift(curr);
        nodesAlreadyInCycle[curr] = true;
        curr = predecessor[curr];
      }
      cycle.unshift(curr);
      cycle.push(curr);
      cycles.push(cycle);
    }
  });

  return cycles;
}
