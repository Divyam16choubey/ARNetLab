/**
 * ARNetLab — PacketSimulator
 *
 * Simulates a virtual network packet traveling along a calculated Dijkstra shortest path.
 *
 * Responsibilities:
 * - Manage simulation state machine (IDLE, READY, RUNNING, PAUSED, COMPLETED, STOPPED, ERROR)
 * - Move packet edge-by-edge at constant world-space speed using frame-rate independent delta time
 * - Emit discrete milestone events (onStart, onNodeReached, onEdgeChanged, onComplete, onStop, onError)
 * - Safeguard against dynamic topology mutations (edge/node deletion during transit)
 * - Never update React state per frame
 */

export const SIMULATION_STATUS = {
  IDLE: 'IDLE',
  READY: 'READY',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  STOPPED: 'STOPPED',
  ERROR: 'ERROR',
};

// Default travel speed in meters per second (in tabletop AR ~0.35m/s gives ~1-2s per hop)
export const DEFAULT_PACKET_SPEED = 0.35;

let packetCounter = 0;

export class PacketSimulator {
  /**
   * @param {Object} options
   * @param {number} [options.speed] — travel speed in meters per second
   * @param {(event: Object) => void} [options.onStart]
   * @param {(event: Object) => void} [options.onNodeReached]
   * @param {(event: Object) => void} [options.onEdgeChanged]
   * @param {(event: Object) => void} [options.onComplete]
   * @param {(event: Object) => void} [options.onStop]
   * @param {(event: Object) => void} [options.onError]
   */
  constructor(options = {}) {
    this.speed = options.speed || DEFAULT_PACKET_SPEED;

    this.onStart = options.onStart || null;
    this.onNodeReached = options.onNodeReached || null;
    this.onEdgeChanged = options.onEdgeChanged || null;
    this.onComplete = options.onComplete || null;
    this.onStop = options.onStop || null;
    this.onError = options.onError || null;

    /** @type {string} */
    this.status = SIMULATION_STATUS.IDLE;

    /** @type {string|null} */
    this.packetId = null;

    /** @type {string[]} Array of node IDs along the route */
    this.routeNodeIds = [];

    /** @type {string[]} Array of edge IDs along the route */
    this.routeEdgeIds = [];

    /** @type {number} Current edge index in the route (0 to routeNodeIds.length - 2) */
    this.currentEdgeIndex = 0;

    /** @type {number} Interpolation progress along the current edge (0 to 1) */
    this.progress = 0;

    /** @type {number} Simulation start timestamp in ms */
    this.startTime = 0;

    /** @type {number} Elapsed simulation time in seconds */
    this.elapsedTime = 0;

    /** @type {{x: number, y: number, z: number}} Current packet 3D position */
    this.currentPosition = { x: 0, y: 0, z: 0 };

    /** @type {string|null} */
    this.currentNodeId = null;

    /** @type {string|null} */
    this.nextNodeId = null;

    /** @type {string|null} */
    this.currentEdgeId = null;
  }

  /**
   * Check if simulation is currently running.
   * @returns {boolean}
   */
  isRunning() {
    return this.status === SIMULATION_STATUS.RUNNING;
  }

  /**
   * Start simulating a packet along the provided route.
   *
   * @param {Object} route — route result from Dijkstra
   * @param {string[]} route.path — node IDs [A, B, C]
   * @param {string[]} route.edgeIds — edge IDs [edge-A-B, edge-B-C]
   * @param {import('./NetworkGraph').NetworkGraph} graph
   * @param {(nodeId: string) => {x: number, y: number, z: number}|null} [positionLookup]
   * @returns {boolean} Whether start succeeded
   */
  start(route, graph, positionLookup) {
    if (!route || !route.path || route.path.length < 2) {
      this._setError('Route must contain at least 2 nodes.');
      return false;
    }

    if (this.status === SIMULATION_STATUS.RUNNING) {
      return false; // Already running
    }

    // Verify all nodes exist in graph
    for (const nodeId of route.path) {
      if (!graph.hasNode(nodeId)) {
        this._setError(`Node ${nodeId} no longer exists in topology.`);
        return false;
      }
    }

    // Verify all edges exist in graph
    for (let i = 0; i < route.path.length - 1; i++) {
      const u = route.path[i];
      const v = route.path[i + 1];
      if (!graph.hasEdge(u, v)) {
        this._setError(`Link between ${u} and ${v} no longer exists.`);
        return false;
      }
    }

    const sourceId = route.path[0];
    const firstPos = this._getNodePosition(sourceId, graph, positionLookup);
    if (!firstPos) {
      this._setError(`Could not determine position for source ${sourceId}.`);
      return false;
    }

    this.packetId = `pkt-${Date.now()}-${++packetCounter}`;
    this.routeNodeIds = [...route.path];
    this.routeEdgeIds = [...(route.edgeIds || [])];
    this.currentEdgeIndex = 0;
    this.progress = 0;
    this.startTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    this.elapsedTime = 0;
    this.currentPosition = { ...firstPos };

    this.currentNodeId = sourceId;
    this.nextNodeId = route.path[1];
    this.currentEdgeId = this.routeEdgeIds[0] || null;

    this.status = SIMULATION_STATUS.RUNNING;

    if (this.onStart) {
      this.onStart({
        packetId: this.packetId,
        sourceId,
        destinationId: route.path[route.path.length - 1],
        routeNodeIds: this.routeNodeIds,
        startPosition: this.currentPosition,
      });
    }

    if (this.onEdgeChanged) {
      this.onEdgeChanged({
        edgeId: this.currentEdgeId,
        fromNodeId: this.currentNodeId,
        toNodeId: this.nextNodeId,
        edgeIndex: 0,
      });
    }

    return true;
  }

  /**
   * Update packet position and route traversal. Called on each render frame.
   *
   * @param {number} deltaTime — elapsed time since last frame in seconds
   * @param {import('./NetworkGraph').NetworkGraph} graph
   * @param {(nodeId: string) => {x: number, y: number, z: number}|null} [positionLookup]
   * @returns {{
   *   position: {x: number, y: number, z: number},
   *   status: string,
   *   progress: number,
   *   currentNodeId: string|null,
   *   nextNodeId: string|null,
   *   currentEdgeId: string|null,
   *   isFinished: boolean
   * }}
   */
  update(deltaTime, graph, positionLookup) {
    if (this.status !== SIMULATION_STATUS.RUNNING) {
      return {
        position: this.currentPosition,
        status: this.status,
        progress: this.progress,
        currentNodeId: this.currentNodeId,
        nextNodeId: this.nextNodeId,
        currentEdgeId: this.currentEdgeId,
        isFinished: this.status === SIMULATION_STATUS.COMPLETED || this.status === SIMULATION_STATUS.STOPPED,
      };
    }

    // Safety clamp for deltaTime to prevent huge jumps on tab switch/freeze
    const dt = Math.min(deltaTime, 0.1);
    this.elapsedTime += dt;

    const fromId = this.routeNodeIds[this.currentEdgeIndex];
    const toId = this.routeNodeIds[this.currentEdgeIndex + 1];

    // Topology Safety: Verify ALL remaining nodes and edges in the active route still exist
    if (!graph) {
      this._setError('Graph unavailable during simulation.');
      return {
        position: this.currentPosition,
        status: this.status,
        progress: this.progress,
        currentNodeId: this.currentNodeId,
        nextNodeId: this.nextNodeId,
        currentEdgeId: this.currentEdgeId,
        isFinished: true,
      };
    }

    for (let i = this.currentEdgeIndex; i < this.routeNodeIds.length; i++) {
      const nId = this.routeNodeIds[i];
      if (!graph.hasNode(nId)) {
        this._setError(`Topology altered during transit: device ${nId} was removed.`);
        return {
          position: this.currentPosition,
          status: this.status,
          progress: this.progress,
          currentNodeId: this.currentNodeId,
          nextNodeId: this.nextNodeId,
          currentEdgeId: this.currentEdgeId,
          isFinished: true,
        };
      }
    }

    for (let i = this.currentEdgeIndex; i < this.routeNodeIds.length - 1; i++) {
      const u = this.routeNodeIds[i];
      const v = this.routeNodeIds[i + 1];
      if (!graph.hasEdge(u, v)) {
        this._setError(`Topology altered during transit: link between ${u} and ${v} was removed.`);
        return {
          position: this.currentPosition,
          status: this.status,
          progress: this.progress,
          currentNodeId: this.currentNodeId,
          nextNodeId: this.nextNodeId,
          currentEdgeId: this.currentEdgeId,
          isFinished: true,
        };
      }
    }

    const posA = this._getNodePosition(fromId, graph, positionLookup);
    const posB = this._getNodePosition(toId, graph, positionLookup);

    if (!posA || !posB) {
      this._setError('Device position lookup failed during simulation.');
      return {
        position: this.currentPosition,
        status: this.status,
        progress: this.progress,
        currentNodeId: this.currentNodeId,
        nextNodeId: this.nextNodeId,
        currentEdgeId: this.currentEdgeId,
        isFinished: true,
      };
    }

    // Calculate 3D segment length
    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const dz = posB.z - posA.z;
    const segmentLength = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Constant speed advancement
    if (segmentLength <= 0.001) {
      this.progress = 1.0;
    } else {
      this.progress += (this.speed * dt) / segmentLength;
    }

    // Check if segment is finished
    if (this.progress >= 1.0) {
      // Reached node posB
      this.currentPosition = { ...posB };
      const reachedNodeId = toId;

      if (this.onNodeReached) {
        this.onNodeReached({
          nodeId: reachedNodeId,
          hopIndex: this.currentEdgeIndex + 1,
          totalHops: this.routeNodeIds.length - 1,
        });
      }

      // Check if this was the final destination
      if (this.currentEdgeIndex >= this.routeNodeIds.length - 2) {
        this.status = SIMULATION_STATUS.COMPLETED;
        this.currentNodeId = reachedNodeId;
        this.nextNodeId = null;
        this.currentEdgeId = null;
        this.progress = 1.0;

        if (this.onComplete) {
          this.onComplete({
            packetId: this.packetId,
            destinationId: reachedNodeId,
            totalTime: Number(this.elapsedTime.toFixed(2)),
            hops: this.routeNodeIds.length - 1,
          });
        }

        return {
          position: this.currentPosition,
          status: this.status,
          progress: 1.0,
          currentNodeId: this.currentNodeId,
          nextNodeId: null,
          currentEdgeId: null,
          isFinished: true,
        };
      }

      // Advance to next edge in route
      this.currentEdgeIndex += 1;
      this.progress = 0;
      this.currentNodeId = this.routeNodeIds[this.currentEdgeIndex];
      this.nextNodeId = this.routeNodeIds[this.currentEdgeIndex + 1];
      this.currentEdgeId = this.routeEdgeIds[this.currentEdgeIndex] || null;

      if (this.onEdgeChanged) {
        this.onEdgeChanged({
          edgeId: this.currentEdgeId,
          fromNodeId: this.currentNodeId,
          toNodeId: this.nextNodeId,
          edgeIndex: this.currentEdgeIndex,
        });
      }
    } else {
      // Interpolate position along current edge
      const t = this.progress;
      this.currentPosition = {
        x: posA.x + dx * t,
        y: posA.y + dy * t,
        z: posA.z + dz * t,
      };
    }

    return {
      position: this.currentPosition,
      status: this.status,
      progress: this.progress,
      currentNodeId: this.currentNodeId,
      nextNodeId: this.nextNodeId,
      currentEdgeId: this.currentEdgeId,
      isFinished: false,
    };
  }

  /**
   * Stop the simulation immediately.
   */
  stop() {
    if (this.status === SIMULATION_STATUS.RUNNING || this.status === SIMULATION_STATUS.PAUSED) {
      this.status = SIMULATION_STATUS.STOPPED;
      if (this.onStop) {
        this.onStop({
          packetId: this.packetId,
          stoppedAtNodeId: this.currentNodeId,
          elapsedTime: Number(this.elapsedTime.toFixed(2)),
        });
      }
    }
  }

  /**
   * Reset the simulation state to IDLE or READY.
   * @param {boolean} [isReady=false]
   */
  reset(isReady = false) {
    this.status = isReady ? SIMULATION_STATUS.READY : SIMULATION_STATUS.IDLE;
    this.packetId = null;
    this.routeNodeIds = [];
    this.routeEdgeIds = [];
    this.currentEdgeIndex = 0;
    this.progress = 0;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.currentPosition = { x: 0, y: 0, z: 0 };
    this.currentNodeId = null;
    this.nextNodeId = null;
    this.currentEdgeId = null;
  }

  /**
   * Safely handle topology changes during or before simulation.
   * If any node or edge in current active route is missing, stop immediately.
   *
   * @param {import('./NetworkGraph').NetworkGraph} graph
   * @returns {boolean} True if route was invalidated and stopped
   */
  handleTopologyChange(graph) {
    if (this.status !== SIMULATION_STATUS.RUNNING) {
      return false;
    }

    if (!graph) {
      this.stop();
      return true;
    }

    // Check all remaining nodes in route
    for (let i = this.currentEdgeIndex; i < this.routeNodeIds.length; i++) {
      const nodeId = this.routeNodeIds[i];
      if (!graph.hasNode(nodeId)) {
        this._setError(`Device ${nodeId} was removed during packet transit.`);
        return true;
      }
    }

    // Check remaining edges
    for (let i = this.currentEdgeIndex; i < this.routeNodeIds.length - 1; i++) {
      const u = this.routeNodeIds[i];
      const v = this.routeNodeIds[i + 1];
      if (!graph.hasEdge(u, v)) {
        this._setError(`Link between ${u} and ${v} was removed during packet transit.`);
        return true;
      }
    }

    return false;
  }

  /**
   * @private
   */
  _setError(message) {
    this.status = SIMULATION_STATUS.ERROR;
    if (this.onError) {
      this.onError({
        message,
        packetId: this.packetId,
      });
    }
  }

  /**
   * Helper to retrieve node 3D coordinates.
   * @private
   */
  _getNodePosition(nodeId, graph, positionLookup) {
    if (positionLookup) {
      const pos = positionLookup(nodeId);
      if (pos) return pos;
    }
    const node = graph?.getNode(nodeId);
    return node?.position || null;
  }
}
