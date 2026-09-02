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
};

const STYLE_ROUTE = {
  color: 0x10b981, // emerald green highlight
  opacity: 0.95,
  cylinderRadius: 0.0035, // thicker glowing route line
};

export class ConnectionManager {
  constructor() {
    /**
     * Map<string, { group: THREE.Group, edge: Object, pos1: Object, pos2: Object, isHighlighted: boolean }>
     * edgeId -> connection visual entry
     */
    this._connections = new Map();

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

    const group = this._createConnectionGroup(pos1, pos2, false);
    group.userData.edgeId = edge.id;
    group.userData.sourceId = edge.source;
    group.userData.targetId = edge.target;

    scene.add(group);

    this._connections.set(edge.id, {
      group,
      edge,
      pos1: { ...pos1 },
      pos2: { ...pos2 },
      isHighlighted: false,
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
  }

  /**
   * Highlight the edges that belong to the active shortest-path route.
   * Edges not in the route are dimmed / set to normal style.
   *
   * @param {THREE.Scene} scene
   * @param {string[]} routeEdgeIds - Array of edge IDs in the route
   */
  highlightRoute(scene, routeEdgeIds = []) {
    const routeSet = new Set(routeEdgeIds);

    for (const [edgeId, entry] of this._connections.entries()) {
      const shouldHighlight = routeSet.has(edgeId);

      if (entry.isHighlighted !== shouldHighlight) {
        // Rebuild connection mesh with new style
        if (scene && entry.group) {
          scene.remove(entry.group);
          this._disposeGroup(entry.group);
        }

        const newGroup = this._createConnectionGroup(entry.pos1, entry.pos2, shouldHighlight);
        newGroup.userData.edgeId = edgeId;
        newGroup.userData.sourceId = entry.edge.source;
        newGroup.userData.targetId = entry.edge.target;

        scene.add(newGroup);
        entry.group = newGroup;
        entry.isHighlighted = shouldHighlight;
      }
    }
  }

  /**
   * Clear all route highlights, returning all connections to normal appearance.
   * @param {THREE.Scene} scene
   */
  clearRouteHighlights(scene) {
    for (const [edgeId, entry] of this._connections.entries()) {
      if (entry.isHighlighted) {
        if (scene && entry.group) {
          scene.remove(entry.group);
          this._disposeGroup(entry.group);
        }

        const newGroup = this._createConnectionGroup(entry.pos1, entry.pos2, false);
        newGroup.userData.edgeId = edgeId;
        newGroup.userData.sourceId = entry.edge.source;
        newGroup.userData.targetId = entry.edge.target;

        scene.add(newGroup);
        entry.group = newGroup;
        entry.isHighlighted = false;
      }
    }
  }

  /**
   * Internal builder for connection geometry (cylinder link between two points in 3D).
   * @private
   */
  _createConnectionGroup(pos1, pos2, isHighlighted) {
    const group = new THREE.Group();
    const style = isHighlighted ? STYLE_ROUTE : STYLE_NORMAL;

    // Connect from device center (y offset ~0.02m)
    const yOffset = 0.015;
    const p1 = new THREE.Vector3(pos1.x, pos1.y + yOffset, pos1.z);
    const p2 = new THREE.Vector3(pos2.x, pos2.y + yOffset, pos2.z);

    const distance = p1.distanceTo(p2);
    if (distance <= 0.001) return group;

    // 3D cylinder mesh
    const geom = new THREE.CylinderGeometry(
      style.cylinderRadius,
      style.cylinderRadius,
      distance,
      8
    );

    const mat = new THREE.MeshStandardMaterial({
      color: style.color,
      emissive: isHighlighted ? 0x10b981 : 0x0284c7,
      emissiveIntensity: isHighlighted ? 0.9 : 0.4,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: style.opacity,
    });

    const cylinder = new THREE.Mesh(geom, mat);

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

    // If highlighted route, add small end pulse rings at endpoints
    if (isHighlighted) {
      const ringGeo = new THREE.RingGeometry(0.004, 0.007, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const ring1 = new THREE.Mesh(ringGeo, ringMat);
      ring1.position.copy(p1);
      ring1.lookAt(p2);
      group.add(ring1);

      const ring2 = new THREE.Mesh(ringGeo, ringMat);
      ring2.position.copy(p2);
      ring2.lookAt(p1);
      group.add(ring2);
    }

    return group;
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
