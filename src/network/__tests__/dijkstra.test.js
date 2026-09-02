import { NetworkGraph } from '../NetworkGraph.js';
import { findShortestPath } from '../dijkstra.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runDijkstraTests() {
  const results = [];

  // CASE 1: A --1-- B --1-- C (Linear chain)
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    g.addNode({ id: 'C', label: 'C', position: { x: 2, y: 0, z: 0 } });

    g.addEdge('A', 'B', 1.0);
    g.addEdge('B', 'C', 1.0);

    const res = findShortestPath(g, 'A', 'C');
    assert(res.reachable === true, 'Case 1 reachable');
    assert(JSON.stringify(res.path) === JSON.stringify(['A', 'B', 'C']), 'Case 1 path');
    assert(res.totalWeight === 2.0, 'Case 1 weight');
    results.push('Case 1: Linear chain passed.');
  }

  // CASE 2: Multi-path with bypass (A-B: 1, B-C: 1, A-C: 10) -> A-B-C chosen
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });
    g.addNode({ id: 'C', label: 'C', position: { x: 2, y: 0, z: 0 } });

    g.addEdge('A', 'B', 1.0);
    g.addEdge('B', 'C', 1.0);
    g.addEdge('A', 'C', 10.0);

    const res = findShortestPath(g, 'A', 'C');
    assert(res.reachable === true, 'Case 2 reachable');
    assert(JSON.stringify(res.path) === JSON.stringify(['A', 'B', 'C']), 'Case 2 path');
    assert(res.totalWeight === 2.0, 'Case 2 weight');
    results.push('Case 2: Shorter path over high-weight bypass passed.');
  }

  // CASE 3: Disconnected components
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });
    g.addNode({ id: 'B', label: 'B', position: { x: 1, y: 0, z: 0 } });

    const res = findShortestPath(g, 'A', 'B');
    assert(res.reachable === false, 'Case 3 unreachable');
    assert(res.path.length === 0, 'Case 3 empty path');
    results.push('Case 3: Disconnected components passed.');
  }

  // CASE 4: Source == Destination
  {
    const g = new NetworkGraph();
    g.addNode({ id: 'A', label: 'A', position: { x: 0, y: 0, z: 0 } });

    const res = findShortestPath(g, 'A', 'A');
    assert(res.reachable === true, 'Case 4 reachable');
    assert(JSON.stringify(res.path) === JSON.stringify(['A']), 'Case 4 self path');
    assert(res.totalWeight === 0, 'Case 4 weight 0');
    results.push('Case 4: Source == Destination passed.');
  }

  // CASE 5: Complex branching graph
  // A -2- B -1- D -3- F
  // A -5- C -1- E -1- F
  // Shortest: A -> B -> D -> F (cost 6) vs A -> C -> E -> F (cost 7)
  {
    const g = new NetworkGraph();
    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(id => {
      g.addNode({ id, label: id, position: { x: 0, y: 0, z: 0 } });
    });

    g.addEdge('A', 'B', 2.0);
    g.addEdge('B', 'D', 1.0);
    g.addEdge('D', 'F', 3.0);

    g.addEdge('A', 'C', 5.0);
    g.addEdge('C', 'E', 1.0);
    g.addEdge('E', 'F', 1.0);

    const res = findShortestPath(g, 'A', 'F');
    assert(res.reachable === true, 'Case 5 reachable');
    assert(JSON.stringify(res.path) === JSON.stringify(['A', 'B', 'D', 'F']), 'Case 5 path');
    assert(res.totalWeight === 6.0, 'Case 5 weight 6');
    results.push('Case 5: Complex branching graph passed.');
  }

  // CASE 6: Dynamic Edge Removal
  {
    const g = new NetworkGraph();
    ['A', 'B', 'C'].forEach(id => {
      g.addNode({ id, label: id, position: { x: 0, y: 0, z: 0 } });
    });
    g.addEdge('A', 'B', 1.0);
    g.addEdge('B', 'C', 1.0);

    // Initial path A -> B -> C
    assert(findShortestPath(g, 'A', 'C').reachable === true, 'Case 6 initial');

    // Remove B-C
    g.removeEdge('B', 'C');
    const res = findShortestPath(g, 'A', 'C');
    assert(res.reachable === false, 'Case 6 after edge removal');
    results.push('Case 6: Dynamic edge removal passed.');
  }

  // CASE 7: Dynamic Node Removal (Cascade removal of edges)
  {
    const g = new NetworkGraph();
    ['A', 'B', 'C'].forEach(id => {
      g.addNode({ id, label: id, position: { x: 0, y: 0, z: 0 } });
    });
    g.addEdge('A', 'B', 1.0);
    g.addEdge('B', 'C', 1.0);

    // Remove node B
    g.removeNode('B');
    assert(g.getEdges().length === 0, 'Case 7 edges deleted');
    const res = findShortestPath(g, 'A', 'C');
    assert(res.reachable === false, 'Case 7 unreachable after node removal');
    results.push('Case 7: Dynamic node removal passed.');
  }

  return results;
}

// Run if executed directly
if (typeof process !== 'undefined' && process.argv[1]?.includes('dijkstra.test.js')) {
  try {
    const res = runDijkstraTests();
    console.log('ALL TESTS PASSED:\n' + res.join('\n'));
  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
}
