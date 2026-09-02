/**
 * ARNetLab — NetworkGraph
 *
 * Adjacency-list based undirected graph model for network topology.
 * Tracks nodes and weighted edges where weight represents 3D Euclidean distance.
 *
 * Responsibilities:
 * - Store nodes (devices) and undirected edges (connections)
 * - Prevent self-loops and duplicate connections
 * - Automatically remove incident edges when a node is removed
 * - Provide adjacency queries for routing algorithms
 */

export class NetworkGraph {
  constructor() {
    /** @type {Map<string, { id: string, type: string, label: string, position: {x: number, y: number, z: number}, color?: string }>} */
    this._nodes = new Map();

    /** @type {Map<string, { id: string, source: string, target: string, weight: number }>} */
    this._edges = new Map();

    /** @type {Map<string, Set<string>>} nodeId -> Set of neighbor nodeIds */
    this._adjacency = new Map();
  }

  /**
   * Add a node to the graph.
   * @param {{ id: string, type: string, label: string, position: {x: number, y: number, z: number}, color?: string }} node
   */
  addNode(node) {
    if (!node || !node.id) return;
    this._nodes.set(node.id, { ...node });
    if (!this._adjacency.has(node.id)) {
      this._adjacency.set(node.id, new Set());
    }
  }

  /**
   * Update node position or properties.
   * @param {string} nodeId
   * @param {Partial<{ position: {x: number, y: number, z: number}, label: string, color: string }>} updates
   */
  updateNode(nodeId, updates) {
    const existing = this._nodes.get(nodeId);
    if (!existing) return;
    this._nodes.set(nodeId, { ...existing, ...updates });

    // Recalculate weights of any incident edges
    for (const edge of this._edges.values()) {
      if (edge.source === nodeId || edge.target === nodeId) {
        const nodeA = this._nodes.get(edge.source);
        const nodeB = this._nodes.get(edge.target);
        if (nodeA?.position && nodeB?.position) {
          edge.weight = NetworkGraph.calculateDistance(nodeA.position, nodeB.position);
        }
      }
    }
  }

  /**
   * Remove a node and all its incident edges.
   * @param {string} nodeId
   * @returns {string[]} Array of removed edge IDs
   */
  removeNode(nodeId) {
    if (!this._nodes.has(nodeId)) return [];

    const removedEdgeIds = [];

    // Find and remove all incident edges
    for (const [edgeId, edge] of Array.from(this._edges.entries())) {
      if (edge.source === nodeId || edge.target === nodeId) {
        this._edges.delete(edgeId);
        removedEdgeIds.push(edgeId);
      }
    }

    // Clean adjacency list
    const neighbors = this._adjacency.get(nodeId);
    if (neighbors) {
      for (const neighborId of neighbors) {
        this._adjacency.get(neighborId)?.delete(nodeId);
      }
    }
    this._adjacency.delete(nodeId);
    this._nodes.delete(nodeId);

    return removedEdgeIds;
  }

  /**
   * Add an undirected edge between two nodes.
   * Calculates Euclidean distance weight automatically if not provided.
   *
   * @param {string} sourceId
   * @param {string} targetId
   * @param {number} [customWeight]
   * @returns {{ id: string, source: string, target: string, weight: number }|null}
   */
  addEdge(sourceId, targetId, customWeight) {
    if (!sourceId || !targetId) return null;
    if (sourceId === targetId) return null; // No self-connections
    if (!this._nodes.has(sourceId) || !this._nodes.has(targetId)) return null;

    // Check if edge already exists in either direction
    if (this.hasEdge(sourceId, targetId)) {
      return this.getEdgeBetween(sourceId, targetId);
    }

    const nodeA = this._nodes.get(sourceId);
    const nodeB = this._nodes.get(targetId);

    let weight = customWeight;
    if (weight === undefined || isNaN(weight)) {
      weight = NetworkGraph.calculateDistance(nodeA.position, nodeB.position);
    }

    // Standardized edge ID (alphabetical order for undirected consistency)
    const [u, v] = [sourceId, targetId].sort();
    const edgeId = `edge-${u}-${v}`;

    const edge = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      weight: Math.max(0.001, Number(weight.toFixed(4))), // Ensure non-negative numerical safety
    };

    this._edges.set(edgeId, edge);

    this._adjacency.get(sourceId)?.add(targetId);
    this._adjacency.get(targetId)?.add(sourceId);

    return edge;
  }

  /**
   * Remove an edge by edgeId or by node endpoints.
   * @param {string} edgeIdOrSource
   * @param {string} [targetId]
   * @returns {boolean}
   */
  removeEdge(edgeIdOrSource, targetId) {
    let edgeId = edgeIdOrSource;
    if (targetId) {
      const [u, v] = [edgeIdOrSource, targetId].sort();
      edgeId = `edge-${u}-${v}`;
    }

    const edge = this._edges.get(edgeId);
    if (!edge) return false;

    this._edges.delete(edgeId);
    this._adjacency.get(edge.source)?.delete(edge.target);
    this._adjacency.get(edge.target)?.delete(edge.source);

    return true;
  }

  /**
   * Check if an edge exists between two nodes.
   * @param {string} sourceId
   * @param {string} targetId
   * @returns {boolean}
   */
  hasEdge(sourceId, targetId) {
    const [u, v] = [sourceId, targetId].sort();
    return this._edges.has(`edge-${u}-${v}`);
  }

  /**
   * Get edge between two nodes if it exists.
   * @param {string} sourceId
   * @param {string} targetId
   * @returns {{ id: string, source: string, target: string, weight: number }|null}
   */
  getEdgeBetween(sourceId, targetId) {
    const [u, v] = [sourceId, targetId].sort();
    return this._edges.get(`edge-${u}-${v}`) || null;
  }

  /**
   * Get all neighbors of a node with weights.
   * @param {string} nodeId
   * @returns {Array<{ nodeId: string, edgeId: string, weight: number }>}
   */
  getNeighbors(nodeId) {
    const neighborSet = this._adjacency.get(nodeId);
    if (!neighborSet) return [];

    const result = [];
    for (const neighborId of neighborSet) {
      const edge = this.getEdgeBetween(nodeId, neighborId);
      if (edge) {
        result.push({
          nodeId: neighborId,
          edgeId: edge.id,
          weight: edge.weight,
        });
      }
    }
    return result;
  }

  /**
   * Get a node by ID.
   * @param {string} nodeId
   */
  getNode(nodeId) {
    return this._nodes.get(nodeId) || null;
  }

  /**
   * Get all nodes as an array.
   */
  getNodes() {
    return Array.from(this._nodes.values());
  }

  /**
   * Get all edges as an array.
   */
  getEdges() {
    return Array.from(this._edges.values());
  }

  /**
   * Check if node exists.
   * @param {string} nodeId
   */
  hasNode(nodeId) {
    return this._nodes.has(nodeId);
  }

  /**
   * Clear all nodes and edges.
   */
  clear() {
    this._nodes.clear();
    this._edges.clear();
    this._adjacency.clear();
  }

  /**
   * Calculate 3D Euclidean distance between two positions in space.
   * @param {{x: number, y: number, z: number}} pos1
   * @param {{x: number, y: number, z: number}} pos2
   * @returns {number} Distance in meters
   */
  static calculateDistance(pos1, pos2) {
    if (!pos1 || !pos2) return 1.0;
    const dx = (pos2.x || 0) - (pos1.x || 0);
    const dy = (pos2.y || 0) - (pos1.y || 0);
    const dz = (pos2.z || 0) - (pos1.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
