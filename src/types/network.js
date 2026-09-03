/**
 * ARNetLab — Type Definitions (JSDoc)
 *
 * Core type definitions and contracts for network visualization,
 * device nodes, weighted edges, and routing topologies.
 */

/**
 * @typedef {'PC' | 'SWITCH' | 'ROUTER' | 'SERVER'} NodeType
 */

/**
 * @typedef {Object} Position3D
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef {Object} NetworkNode
 * @property {string} id - Unique identifier
 * @property {NodeType} type - Device type
 * @property {string} label - Display label
 * @property {Position3D} position - 3D world position
 */

/**
 * @typedef {Object} NetworkEdge
 * @property {string} id - Unique identifier
 * @property {string} source - Source node ID
 * @property {string} target - Target node ID
 * @property {number} weight - Edge weight (e.g., Euclidean distance)
 */

/**
 * @typedef {Object} Route
 * @property {string[]} nodeIds - Ordered node IDs in the path
 * @property {number} totalWeight - Sum of edge weights
 */

/**
 * @typedef {'unavailable' | 'checking' | 'ready' | 'active' | 'error'} ARSessionStatus
 */

/**
 * @typedef {Object} ARSessionState
 * @property {ARSessionStatus} status
 * @property {boolean} surfaceDetected
 * @property {string|null} errorMessage
 */

// Export nothing — this file exists solely for type documentation.
export {};
