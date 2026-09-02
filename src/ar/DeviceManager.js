/**
 * ARNetLab — DeviceManager
 *
 * Manages placed 3D network devices in the AR scene.
 *
 * Responsibilities:
 * - Store nodeId → THREE.Group mapping
 * - Add/remove devices via DeviceFactory
 * - Attach/remove labels via LabelManager
 * - Raycast against device meshes for selection
 * - Apply/clear selection highlight
 * - Dispose all on cleanup
 */

import * as THREE from 'three';
import { createDeviceMesh, setDeviceSelected, clearDeviceSelected } from './DeviceFactory';
import { createLabelSprite, disposeLabelSprite } from './LabelManager';

export class DeviceManager {
  constructor() {
    /** @type {Map<string, THREE.Group>} nodeId → device group */
    this._devices = new Map();

    /** @type {Map<string, THREE.Sprite>} nodeId → label sprite */
    this._labels = new Map();

    /** @type {string|null} */
    this._selectedId = null;

    /** @type {THREE.Raycaster} reused for selection */
    this._raycaster = new THREE.Raycaster();
  }

  /**
   * Add a device to the scene.
   * @param {THREE.Scene} scene
   * @param {'PC'|'SWITCH'|'ROUTER'|'SERVER'} type
   * @param {THREE.Matrix4} poseMatrix — world transform for placement
   * @param {string} nodeId — unique ID
   * @param {string} label — e.g. "PC-01"
   * @param {string} colorHex — e.g. "#3b82f6"
   */
  addDevice(scene, type, poseMatrix, nodeId, label, colorHex) {
    // Create mesh
    const group = createDeviceMesh(type);
    group.matrixAutoUpdate = false;
    group.matrix.copy(poseMatrix);
    group.userData.nodeId = nodeId;
    group.userData.deviceType = type;

    scene.add(group);
    this._devices.set(nodeId, group);

    // Create label
    const sprite = createLabelSprite(label, colorHex);
    // Label is added as a child of the group so it moves with the device.
    // But since group.matrixAutoUpdate = false and sprite needs its own
    // position, we add sprite to scene with manual positioning.
    // Actually simpler: add as child so it inherits the transform.
    group.add(sprite);
    this._labels.set(nodeId, sprite);
  }

  /**
   * Remove a device from the scene.
   * @param {THREE.Scene} scene
   * @param {string} nodeId
   */
  removeDevice(scene, nodeId) {
    // Clear selection if this device is selected
    if (this._selectedId === nodeId) {
      this._selectedId = null;
    }

    // Remove label
    const sprite = this._labels.get(nodeId);
    if (sprite) {
      disposeLabelSprite(sprite);
      this._labels.delete(nodeId);
    }

    // Remove device
    const group = this._devices.get(nodeId);
    if (group) {
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
      scene.remove(group);
      this._devices.delete(nodeId);
    }
  }

  /**
   * Remove all devices from the scene.
   * @param {THREE.Scene} scene
   */
  removeAll(scene) {
    for (const nodeId of Array.from(this._devices.keys())) {
      this.removeDevice(scene, nodeId);
    }
    this._selectedId = null;
  }

  /**
   * Raycast against all device meshes to find which device (if any) is under a screen point.
   * Uses normalized device coordinates (NDC).
   *
   * @param {THREE.Camera} camera
   * @param {number} ndcX — normalized x (-1 to 1)
   * @param {number} ndcY — normalized y (-1 to 1)
   * @returns {string|null} — nodeId of the hit device, or null
   */
  getDeviceAtScreenPoint(camera, ndcX, ndcY) {
    if (!camera) return null;
    this._raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

    // Collect all meshes (excluding sprites/labels and selection indicators)
    const meshes = [];
    for (const group of this._devices.values()) {
      group.traverse((obj) => {
        if (obj.isMesh && obj.name !== '_selectionRing') meshes.push(obj);
      });
    }

    if (meshes.length === 0) return null;

    const intersects = this._raycaster.intersectObjects(meshes, true);
    if (intersects.length === 0) return null;

    // Walk up from the intersected mesh to find the device group
    let obj = intersects[0].object;
    while (obj) {
      if (obj.userData && obj.userData.nodeId) {
        return obj.userData.nodeId;
      }
      obj = obj.parent;
    }

    return null;
  }

  /**
   * Get the world position of a placed device.
   * @param {string} nodeId
   * @returns {{x: number, y: number, z: number}|null}
   */
  getNodePosition(nodeId) {
    const group = this._devices.get(nodeId);
    if (!group) return null;
    const pos = new THREE.Vector3();
    pos.setFromMatrixPosition(group.matrix);
    return {
      x: Number(pos.x.toFixed(3)),
      y: Number(pos.y.toFixed(3)),
      z: Number(pos.z.toFixed(3)),
    };
  }

  /**
   * Set a device as selected (emissive highlight).
   * @param {string} nodeId
   */
  setSelected(nodeId) {
    // Clear previous
    this.clearSelection();

    const group = this._devices.get(nodeId);
    if (group) {
      setDeviceSelected(group);
      this._selectedId = nodeId;
    }
  }

  /**
   * Clear the current selection highlight.
   */
  clearSelection() {
    if (this._selectedId) {
      const group = this._devices.get(this._selectedId);
      if (group) {
        clearDeviceSelected(group);
      }
      this._selectedId = null;
    }
  }

  /**
   * Get the currently selected device ID.
   * @returns {string|null}
   */
  getSelectedId() {
    return this._selectedId;
  }

  /**
   * Check if any devices exist.
   * @returns {boolean}
   */
  hasDevices() {
    return this._devices.size > 0;
  }

  /**
   * Dispose all resources.
   * @param {THREE.Scene} [scene]
   */
  dispose(scene) {
    if (scene) {
      this.removeAll(scene);
    }
    this._devices.clear();
    this._labels.clear();
    this._selectedId = null;
  }
}
