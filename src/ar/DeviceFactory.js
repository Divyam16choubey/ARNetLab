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

const SELECTION_EMISSIVE = 0x444444;

/**
 * Create a network device mesh group.
 * @param {'PC'|'SWITCH'|'ROUTER'|'SERVER'} type
 * @returns {THREE.Group}
 */
export function createDeviceMesh(type) {
  switch (type) {
    case 'PC':
      return _createPC();
    case 'SWITCH':
      return _createSwitch();
    case 'ROUTER':
      return _createRouter();
    case 'SERVER':
      return _createServer();
    default:
      return _createPC();
  }
}

/**
 * Apply selection highlight to a device group.
 * @param {THREE.Group} group
 */
export function setDeviceSelected(group) {
  group.traverse((obj) => {
    if (obj.isMesh && obj.material && obj.material.emissive) {
      obj.material.emissive.setHex(SELECTION_EMISSIVE);
    }
  });
}

/**
 * Remove selection highlight from a device group.
 * @param {THREE.Group} group
 */
export function clearDeviceSelected(group) {
  group.traverse((obj) => {
    if (obj.isMesh && obj.material && obj.material.emissive) {
      obj.material.emissive.setHex(0x000000);
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
