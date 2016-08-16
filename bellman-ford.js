/**
 * Bellman-Ford algorithm
 * @param  {Array}  vertices Vertices
 * @param  {Array}  edges    Edges, with properties u, v, and w for weight
 * @param  {String} source   Source node
 * @return {Object}          Distance and predecessor maps
 */
export default function bellmanFord(vertices = [], edges = [], source) {
  // Step 1: initialize graph
  const distance = {};
  const predecessor = {};
  vertices.forEach(v => {
    // At the beginning , all vertices have a weight of infinity
    // and null predecessor
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

  // Step 3: check for negative-weight cycles
  edges.forEach(({ u, v, w }) => {
    if (distance[u] + w < distance[v]) {
      throw 'Graph contains a negative-weight cycle!';
    }
  });

  return { distance, predecessor };
}
