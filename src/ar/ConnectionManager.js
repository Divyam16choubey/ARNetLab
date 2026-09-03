/**
 * ARNetLab — ConnectionManager
 *
 * Manages 3D visual lines and connections between network devices in the AR scene.
 *
 * Responsibilities:
 * - Create 3D line meshes connecting device world coordinates
 * - Update connection visual styles (normal link vs highlighted route link)
 * - Support route highlighting for Dijkstra shortest path
 * - Cleanly dispose line geometries and materials on removal/reset
 */

import * as THREE from 'three';

// Visual styles for network connections
const STYLE_NORMAL = {
  color: 0x38bdf8, // light cyan / sky blue
  opacity: 0.75,
  cylinderRadius: 0.0018, // 1.8mm slim 3D cylinder
  emissive: 0x0284c7,
  emissiveIntensity: 0.4,
};

const STYLE_ROUTE = {
  color: 0x10b981, // emerald green highlight
  opacity: 0.95,
  cylinderRadius: 0.0035, // thicker glowing route line
  emissive: 0x10b981,
  emissiveIntensity: 0.9,
};

const STYLE_ACTIVE_PACKET = {
  color: 0xf59e0b, // bright amber gold for active traversing link
  opacity: 1.0,
  cylinderRadius: 0.0045, // slightly thicker pulse
  emissive: 0xfbbf24,
  emissiveIntensity: 1.3,
};

export class ConnectionManager {
  constructor() {
    /**
     * Map<string, { group: THREE.Group, edge: Object, pos1: Object, pos2: Object, isHighlighted: boolean, isPacketActive: boolean }>
     * edgeId -> connection visual entry
     */
    this._connections = new Map();

    /** @type {Set<string>} Active route edge IDs */
    this._routeEdgeIds = new Set();

    /** @type {string|null} Currently active edge traversed by packet */
    this._activePacketEdgeId = null;

    // Reusable temp vectors for orientation calculations
    this._v1 = new THREE.Vector3();
    this._v2 = new THREE.Vector3();
    this._direction = new THREE.Vector3();
    this._axis = new THREE.Vector3(0, 1, 0);
  }

  /**
   * Create and add a visual 3D connection between two device positions.
   *
   * @param {THREE.Scene} scene
   * @param {{ id: string, source: string, target: string, weight: number }} edge
   * @param {{ x: number, y: number, z: number }} pos1
   * @param {{ x: number, y: number, z: number }} pos2
   */
  addConnection(scene, edge, pos1, pos2) {
    if (!scene || !edge || !pos1 || !pos2) return;

    // Remove existing if any with same edge ID
    if (this._connections.has(edge.id)) {
      this.removeConnection(scene, edge.id);
    }

    const isRoute = this._routeEdgeIds.has(edge.id);
    const isPacketActive = this._activePacketEdgeId === edge.id;
    const mode = isPacketActive ? 'packet' : isRoute ? 'route' : 'normal';

    const { group, cylinder, ring1, ring2 } = this._createConnectionGroup(pos1, pos2, mode);
    group.userData.edgeId = edge.id;
    group.userData.sourceId = edge.source;
    group.userData.targetId = edge.target;

    scene.add(group);

    this._connections.set(edge.id, {
      group,
      cylinder,
      ring1,
      ring2,
      edge,
      pos1: { ...pos1 },
      pos2: { ...pos2 },
      isHighlighted: isRoute,
      isPacketActive,
    });
  }

  /**
   * Remove a connection visual from the scene.
   * @param {THREE.Scene} scene
   * @param {string} edgeId
   */
  removeConnection(scene, edgeId) {
    const entry = this._connections.get(edgeId);
    if (!entry) return;

    if (this._activePacketEdgeId === edgeId) {
      this._activePacketEdgeId = null;
    }
    this._routeEdgeIds.delete(edgeId);

    if (scene && entry.group) {
      scene.remove(entry.group);
      this._disposeGroup(entry.group);
    }

    this._connections.delete(edgeId);
  }

  /**
   * Remove all connections from the scene.
   * @param {THREE.Scene} scene
   */
  removeAll(scene) {
    for (const edgeId of Array.from(this._connections.keys())) {
      this.removeConnection(scene, edgeId);
    }
    this._connections.clear();
    this._routeEdgeIds.clear();
    this._activePacketEdgeId = null;
  }

  /**
   * Highlight the edges that belong to the active shortest-path route.
   * Edges not in the route are dimmed / set to normal style.
   *
   * @param {THREE.Scene} scene
   * @param {string[]} routeEdgeIds - Array of edge IDs in the route
   */
  highlightRoute(scene, routeEdgeIds = []) {
    this._routeEdgeIds = new Set(routeEdgeIds);

    for (const [edgeId, entry] of this._connections.entries()) {
      const isRoute = this._routeEdgeIds.has(edgeId);
      const isPacketActive = this._activePacketEdgeId === edgeId;
      const targetMode = isPacketActive ? 'packet' : isRoute ? 'route' : 'normal';

      this._updateConnectionStyle(entry, targetMode);
      entry.isHighlighted = isRoute;
      entry.isPacketActive = isPacketActive;
    }
  }

  /**
   * Highlight the specific edge currently being traversed by the virtual packet.
   *
   * @param {THREE.Scene} scene
   * @param {string|null} edgeId
   */
  setActivePacketEdge(scene, edgeId) {
    if (this._activePacketEdgeId === edgeId) return;

    const prevEdgeId = this._activePacketEdgeId;
    this._activePacketEdgeId = edgeId;

    // Restore previous active edge to its route or normal state
    if (prevEdgeId && this._connections.has(prevEdgeId)) {
      const prevEntry = this._connections.get(prevEdgeId);
      const targetMode = this._routeEdgeIds.has(prevEdgeId) ? 'route' : 'normal';
      this._updateConnectionStyle(prevEntry, targetMode);
      prevEntry.isHighlighted = this._routeEdgeIds.has(prevEdgeId);
      prevEntry.isPacketActive = false;
    }

    // Set new active packet edge
    if (edgeId && this._connections.has(edgeId)) {
      const entry = this._connections.get(edgeId);
      this._updateConnectionStyle(entry, 'packet');
      entry.isHighlighted = this._routeEdgeIds.has(edgeId);
      entry.isPacketActive = true;
    }
  }

  /**
   * Clear the active packet traversing edge highlight, returning it to route/normal style.
   * @param {THREE.Scene} scene
   */
  clearActivePacketEdge(scene) {
    this.setActivePacketEdge(scene, null);
  }

  /**
   * Clear all route highlights, returning all connections to normal appearance.
   * @param {THREE.Scene} [_scene]
   */
  clearRouteHighlights(_scene) {
    this._routeEdgeIds.clear();
    this._activePacketEdgeId = null;

    for (const entry of this._connections.values()) {
      this._updateConnectionStyle(entry, 'normal');
      entry.isHighlighted = false;
      entry.isPacketActive = false;
    }
  }

  /**
   * Mutate connection materials in-place to avoid WebGL reallocation during simulation.
   * @private
   */
  _updateConnectionStyle(entry, mode) {
    if (!entry) return;
    const style = mode === 'packet' ? STYLE_ACTIVE_PACKET : mode === 'route' ? STYLE_ROUTE : STYLE_NORMAL;
    const isRouteOrPacket = mode === 'route' || mode === 'packet';

    if (entry.cylinder && entry.cylinder.material) {
      entry.cylinder.material.color.setHex(style.color);
      entry.cylinder.material.emissive.setHex(style.emissive);
      entry.cylinder.material.emissiveIntensity = style.emissiveIntensity;
      entry.cylinder.material.opacity = style.opacity;
      const radiusRatio = style.cylinderRadius / STYLE_NORMAL.cylinderRadius;
      entry.cylinder.scale.set(radiusRatio, 1, radiusRatio);
    }

    const ringColor = mode === 'packet' ? 0xfbbf24 : 0x34d399;
    if (entry.ring1) {
      entry.ring1.visible = isRouteOrPacket;
      if (entry.ring1.material) entry.ring1.material.color.setHex(ringColor);
    }
    if (entry.ring2) {
      entry.ring2.visible = isRouteOrPacket;
      if (entry.ring2.material) entry.ring2.material.color.setHex(ringColor);
    }
  }

  /**
   * Internal builder for connection geometry (cylinder link between two points in 3D).
   * @param {{x: number, y: number, z: number}} pos1
   * @param {{x: number, y: number, z: number}} pos2
   * @param {'normal'|'route'|'packet'} [mode='normal']
   * @returns {{ group: THREE.Group, cylinder: THREE.Mesh|null, ring1: THREE.Mesh|null, ring2: THREE.Mesh|null }}
   * @private
   */
  _createConnectionGroup(pos1, pos2, mode = 'normal') {
    const group = new THREE.Group();
    const style = mode === 'packet' ? STYLE_ACTIVE_PACKET : mode === 'route' ? STYLE_ROUTE : STYLE_NORMAL;
    const isRouteOrPacket = mode === 'route' || mode === 'packet';

    // Connect from device center (y offset ~0.02m)
    const yOffset = 0.015;
    const p1 = new THREE.Vector3(pos1.x, pos1.y + yOffset, pos1.z);
    const p2 = new THREE.Vector3(pos2.x, pos2.y + yOffset, pos2.z);

    const distance = p1.distanceTo(p2);
    if (distance <= 0.001) return { group, cylinder: null, ring1: null, ring2: null };

    // 3D cylinder mesh
    const geom = new THREE.CylinderGeometry(
      STYLE_NORMAL.cylinderRadius,
      STYLE_NORMAL.cylinderRadius,
      distance,
      8
    );

    const mat = new THREE.MeshStandardMaterial({
      color: style.color,
      emissive: style.emissive,
      emissiveIntensity: style.emissiveIntensity,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: style.opacity,
    });

    const cylinder = new THREE.Mesh(geom, mat);
    const radiusRatio = style.cylinderRadius / STYLE_NORMAL.cylinderRadius;
    cylinder.scale.set(radiusRatio, 1, radiusRatio);

    // Position cylinder at midpoint
    const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    cylinder.position.copy(midpoint);

    // Orient cylinder along p1 -> p2
    this._direction.subVectors(p2, p1).normalize();

    // Default cylinder points along Y axis (0, 1, 0)
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(this._axis, this._direction);
    cylinder.setRotationFromQuaternion(quaternion);

    group.add(cylinder);

    // End pulse rings at endpoints
    const ringGeo = new THREE.RingGeometry(0.004, 0.007, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: mode === 'packet' ? 0xfbbf24 : 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.copy(p1);
    ring1.lookAt(p2);
    ring1.visible = isRouteOrPacket;
    group.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo.clone(), ringMat.clone());
    ring2.position.copy(p2);
    ring2.lookAt(p1);
    ring2.visible = isRouteOrPacket;
    group.add(ring2);

    return { group, cylinder, ring1, ring2 };
  }

  /**
   * Dispose all geometries and materials in a group.
   * @private
   */
  _disposeGroup(group) {
    if (!group) return;
    group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }

  /**
   * Dispose all resources.
   * @param {THREE.Scene} [scene]
   */
  dispose(scene) {
    if (scene) {
      this.removeAll(scene);
    }
    this._connections.clear();
  }
}
