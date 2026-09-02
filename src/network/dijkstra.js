/**
 * ARNetLab — Dijkstra Shortest-Path Algorithm
 *
 * Computes the optimal (lowest cost / shortest 3D distance) route
 * between two nodes in a NetworkGraph.
 *
 * @param {import('./NetworkGraph').NetworkGraph} graph
 * @param {string} sourceId
 * @param {string} destinationId
 * @returns {{
 *   reachable: boolean,
 *   path: string[],
 *   edgeIds: string[],
 *   totalWeight: number,
 *   error?: string
 * }}
 */
export function findShortestPath(graph, sourceId, destinationId) {
  if (!graph || !sourceId || !destinationId) {
    return {
      reachable: false,
      path: [],
      edgeIds: [],
      totalWeight: 0,
      error: 'Missing parameters',
    };
  }

  if (!graph.hasNode(sourceId) || !graph.hasNode(destinationId)) {
    return {
      reachable: false,
      path: [],
      edgeIds: [],
      totalWeight: 0,
      error: 'Source or destination does not exist in graph',
    };
  }

  // Case: Source equals Destination
  if (sourceId === destinationId) {
    return {
      reachable: true,
      path: [sourceId],
      edgeIds: [],
      totalWeight: 0,
    };
  }

  const nodes = graph.getNodes();
  const distances = new Map();
  /** @type {Map<string, { prevNodeId: string, edgeId: string } | null>} */
  const previous = new Map();
  const unvisited = new Set();

  for (const node of nodes) {
    distances.set(node.id, Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  }

  distances.set(sourceId, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId);
      if (dist < minDistance) {
        minDistance = dist;
        current = nodeId;
      }
    }

    // If no reachable unvisited node or reached target
    if (current === null || minDistance === Infinity) {
      break;
    }

    if (current === destinationId) {
      break; // Found shortest path to destination
    }

    unvisited.delete(current);

    const neighbors = graph.getNeighbors(current);
    for (const { nodeId: neighborId, edgeId, weight } of neighbors) {
      if (!unvisited.has(neighborId)) continue;

      const alt = minDistance + weight;
      if (alt < distances.get(neighborId)) {
        distances.set(neighborId, alt);
        previous.set(neighborId, { prevNodeId: current, edgeId });
      }
    }
  }

  // If destination is unreachable
  if (distances.get(destinationId) === Infinity) {
    return {
      reachable: false,
      path: [],
      edgeIds: [],
      totalWeight: Infinity,
    };
  }

  // Reconstruct path from destination back to source
  const path = [];
  const edgeIds = [];
  let curr = destinationId;

  while (curr) {
    path.unshift(curr);
    if (curr === sourceId) break;

    const prev = previous.get(curr);
    if (!prev) break;

    edgeIds.unshift(prev.edgeId);
    curr = prev.prevNodeId;
  }

  return {
    reachable: true,
    path,
    edgeIds,
    totalWeight: Number(distances.get(destinationId).toFixed(4)),
  };
}
