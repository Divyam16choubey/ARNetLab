/**
 * ARNetLab — DeviceFactory
 *
 * Creates procedural Three.js geometry for network device types.
 * Each device is a THREE.Group containing lightweight meshes
 * with MeshStandardMaterial (reacts to scene lighting).
 *
 * Device types: PC, SWITCH, ROUTER, SERVER
 * Colors match NODE_TYPE_CONFIG from constants/networkTypes.js
 *
 * All models are ~50-200 vertices, suitable for mobile AR.
 * Scale: ~3-5cm in AR space.
 */

import * as THREE from 'three';

// Colors from NODE_TYPE_CONFIG
const COLORS = {
  PC: 0x3b82f6,
  SWITCH: 0x22c55e,
  ROUTER: 0xf59e0b,
  SERVER: 0xa855f7,
};

// Selection and Role visual constants
const SELECTION_RING_COLOR = 0x38bdf8; // sky blue highlight ring
const SOURCE_RING_COLOR = 0x10b981;    // emerald green source ring
const DEST_RING_COLOR = 0xf43f5e;      // rose/fuchsia destination ring

/**
 * Create a network device mesh group.
 * @param {'PC'|'SWITCH'|'ROUTER'|'SERVER'} type
 * @returns {THREE.Group}
 */
export function createDeviceMesh(type) {
  let group;
  switch (type) {
    case 'PC':
      group = _createPC();
      break;
    case 'SWITCH':
      group = _createSwitch();
      break;
    case 'ROUTER':
      group = _createRouter();
      break;
    case 'SERVER':
      group = _createServer();
      break;
    default:
      group = _createPC();
      break;
  }

  // 1. Selection highlight ring around the base (hidden by default)
  const ringGeo = new THREE.RingGeometry(0.038, 0.044, 32);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: SELECTION_RING_COLOR,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const selectionRing = new THREE.Mesh(ringGeo, ringMat);
  selectionRing.name = '_selectionRing';
  selectionRing.position.y = 0.001;
  selectionRing.visible = false;
  group.add(selectionRing);

  // 2. Source role indicator ring (green, slightly wider)
  const sourceGeo = new THREE.RingGeometry(0.046, 0.052, 32);
  sourceGeo.rotateX(-Math.PI / 2);
  const sourceMat = new THREE.MeshBasicMaterial({
    color: SOURCE_RING_COLOR,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });
  const sourceRing = new THREE.Mesh(sourceGeo, sourceMat);
  sourceRing.name = '_sourceRing';
  sourceRing.position.y = 0.0012;
  sourceRing.visible = false;
  group.add(sourceRing);

  // 3. Destination role indicator ring (rose, slightly wider)
  const destGeo = new THREE.RingGeometry(0.046, 0.052, 32);
  destGeo.rotateX(-Math.PI / 2);
  const destMat = new THREE.MeshBasicMaterial({
    color: DEST_RING_COLOR,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });
  const destRing = new THREE.Mesh(destGeo, destMat);
  destRing.name = '_destRing';
  destRing.position.y = 0.0012;
  destRing.visible = false;
  group.add(destRing);

  // 4. Generous invisible hit volume for reliable touch raycasting on mobile/tablets
  const hitGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.07, 16);
  const hitMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const hitTarget = new THREE.Mesh(hitGeo, hitMat);
  hitTarget.name = 'hitTarget';
  hitTarget.userData.isHitTarget = true;
  hitTarget.position.y = 0.035;
  group.add(hitTarget);

  return group;
}

/**
 * Apply selection highlight to a device group.
 * @param {THREE.Group} group
 */
export function setDeviceSelected(group) {
  group.traverse((obj) => {
    if (obj.name === '_selectionRing') {
      obj.visible = true;
    } else if (obj.isMesh && obj.material && obj.material.emissive && !obj.name.startsWith('_')) {
      if (!obj.userData.origEmissive) {
        obj.userData.origEmissive = obj.material.emissive.getHex();
        obj.userData.origEmissiveIntensity = obj.material.emissiveIntensity ?? 1.0;
      }
      obj.material.emissive.setHex(0x555555);
      obj.material.emissiveIntensity = 0.8;
    }
  });
}

/**
 * Remove selection highlight from a device group.
 * @param {THREE.Group} group
 */
export function clearDeviceSelected(group) {
  group.traverse((obj) => {
    if (obj.name === '_selectionRing') {
      obj.visible = false;
    } else if (obj.isMesh && obj.material && obj.material.emissive && !obj.name.startsWith('_')) {
      const orig = obj.userData.origEmissive !== undefined ? obj.userData.origEmissive : 0x000000;
      const origIntensity = obj.userData.origEmissiveIntensity !== undefined ? obj.userData.origEmissiveIntensity : 1.0;
      obj.material.emissive.setHex(orig);
      obj.material.emissiveIntensity = origIntensity;
    }
  });
}

/**
 * Set the network role indicator on a device group (source, destination, or clear).
 * @param {THREE.Group} group
 * @param {'source'|'destination'|null} role
 */
export function setDeviceRoleVisual(group, role) {
  group.traverse((obj) => {
    if (obj.name === '_sourceRing') {
      obj.visible = role === 'source';
    } else if (obj.name === '_destRing') {
      obj.visible = role === 'destination';
    }
  });
}

// ============================================================
// Device Builders
// ============================================================

function _mat(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.2,
  });
}

function _matDark(color) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color).multiplyScalar(0.3),
    roughness: 0.8,
    metalness: 0.1,
  });
}

/**
 * PC — monitor + stand + base
 * Total height ~4cm
 */
function _createPC() {
  const group = new THREE.Group();
  const c = COLORS.PC;

  // Monitor body
  const monitorGeo = new THREE.BoxGeometry(0.035, 0.025, 0.003);
  const monitor = new THREE.Mesh(monitorGeo, _mat(c));
  monitor.position.set(0, 0.03, 0);
  group.add(monitor);

  // Screen (darker front face)
  const screenGeo = new THREE.BoxGeometry(0.03, 0.02, 0.001);
  const screen = new THREE.Mesh(screenGeo, _matDark(c));
  screen.position.set(0, 0.03, 0.002);
  group.add(screen);

  // Stand
  const standGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.012, 8);
  const stand = new THREE.Mesh(standGeo, _mat(0x888888));
  stand.position.set(0, 0.012, 0);
  group.add(stand);

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.01, 0.012, 0.003, 12);
  const base = new THREE.Mesh(baseGeo, _mat(0x888888));
  base.position.set(0, 0.002, 0);
  group.add(base);

  return group;
}

/**
 * Switch — flat rectangular box with port indicators
 * Total height ~1.5cm
 */
function _createSwitch() {
  const group = new THREE.Group();
  const c = COLORS.SWITCH;

  // Main body
  const bodyGeo = new THREE.BoxGeometry(0.05, 0.008, 0.025);
  const body = new THREE.Mesh(bodyGeo, _mat(c));
  body.position.set(0, 0.005, 0);
  group.add(body);

  // Port indicators (small boxes along the front)
  const portGeo = new THREE.BoxGeometry(0.004, 0.003, 0.002);
  const portMat = _matDark(c);
  for (let i = 0; i < 6; i++) {
    const port = new THREE.Mesh(portGeo, portMat);
    port.position.set(-0.018 + i * 0.007, 0.005, 0.014);
    group.add(port);
  }

  // Status LED
  const ledGeo = new THREE.SphereGeometry(0.0015, 6, 4);
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    emissive: 0x00ff00,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0.02, 0.01, 0.012);
  group.add(led);

  return group;
}

/**
 * Router — compact body + two antennas
 * Total height ~4cm
 */
function _createRouter() {
  const group = new THREE.Group();
  const c = COLORS.ROUTER;

  // Main body
  const bodyGeo = new THREE.BoxGeometry(0.035, 0.01, 0.025);
  const body = new THREE.Mesh(bodyGeo, _mat(c));
  body.position.set(0, 0.006, 0);
  group.add(body);

  // Top panel
  const topGeo = new THREE.BoxGeometry(0.033, 0.002, 0.023);
  const top = new THREE.Mesh(topGeo, _matDark(c));
  top.position.set(0, 0.012, 0);
  group.add(top);

  // Antennas
  const antGeo = new THREE.CylinderGeometry(0.0015, 0.0015, 0.025, 6);
  const antMat = _mat(0x888888);

  const ant1 = new THREE.Mesh(antGeo, antMat);
  ant1.position.set(-0.012, 0.024, -0.008);
  ant1.rotation.z = 0.2;
  group.add(ant1);

  const ant2 = new THREE.Mesh(antGeo, antMat);
  ant2.position.set(0.012, 0.024, -0.008);
  ant2.rotation.z = -0.2;
  group.add(ant2);

  // Status LEDs
  const ledGeo = new THREE.SphereGeometry(0.0015, 6, 4);
  for (let i = 0; i < 3; i++) {
    const ledMat = new THREE.MeshStandardMaterial({
      color: i === 0 ? 0x00ff00 : 0x3b82f6,
      emissive: i === 0 ? 0x00ff00 : 0x3b82f6,
      emissiveIntensity: 0.3,
      roughness: 0.3,
    });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(-0.008 + i * 0.008, 0.007, 0.013);
    group.add(led);
  }

  return group;
}

/**
 * Server — tall rack with horizontal detail lines
 * Total height ~5cm
 */
function _createServer() {
  const group = new THREE.Group();
  const c = COLORS.SERVER;

  // Main rack body
  const bodyGeo = new THREE.BoxGeometry(0.025, 0.045, 0.03);
  const body = new THREE.Mesh(bodyGeo, _mat(c));
  body.position.set(0, 0.024, 0);
  group.add(body);

  // Rack slot lines (horizontal dividers)
  const slotGeo = new THREE.BoxGeometry(0.023, 0.001, 0.001);
  const slotMat = _matDark(c);
  for (let i = 0; i < 4; i++) {
    const slot = new THREE.Mesh(slotGeo, slotMat);
    slot.position.set(0, 0.012 + i * 0.01, 0.016);
    group.add(slot);
  }

  // Front panel indicator
  const panelGeo = new THREE.BoxGeometry(0.02, 0.006, 0.001);
  const panelMat = _matDark(c);
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 0.04, 0.016);
  group.add(panel);

  // Status LED
  const ledGeo = new THREE.SphereGeometry(0.002, 6, 4);
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x00ff00,
    emissive: 0x00ff00,
    emissiveIntensity: 0.5,
    roughness: 0.3,
  });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.position.set(0.008, 0.04, 0.016);
  group.add(led);

  return group;
}
