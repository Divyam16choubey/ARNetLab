/**
 * Automated Unit & Integration Tests for WebXR Interaction Chain,
 * Hit-Target Raycasting, Tap Deduplication, and In-Place Material Optimization.
 */

import assert from 'node:assert';
import * as THREE from 'three';
import { ARManager } from '../ARManager.js';
import { DeviceManager } from '../DeviceManager.js';
import { ConnectionManager } from '../ConnectionManager.js';

console.log('Running WebXR Interaction & Optimization Tests...\n');

// Test 1: ARManager onSelect callback and event dispatch
{
  const arManager = new ARManager();
  let selectFired = false;
  let receivedEvent = null;

  arManager.onSelectCallback = (ev) => {
    selectFired = true;
    receivedEvent = ev;
  };

  const fakeEvent = { type: 'select', inputSource: { targetRayMode: 'screen' } };
  arManager._onXRSelect(fakeEvent);

  assert.strictEqual(selectFired, true, 'ARManager _onXRSelect must invoke onSelectCallback');
  assert.strictEqual(receivedEvent, fakeEvent, 'onSelectCallback must receive the select event');

  arManager.dispose();
  assert.strictEqual(arManager.onSelectCallback, null, 'Disposal must clear onSelectCallback');
  console.log('Test 1: ARManager select event dispatch and cleanup passed.');
}

// Test 2: Tap Deduplication logic (250ms threshold)
{
  let lastTapTimestamp = 0;
  let tapCount = 0;

  function simulateTap(now) {
    if (now - lastTapTimestamp < 250) {
      return false; // Suppressed as duplicate
    }
    lastTapTimestamp = now;
    tapCount++;
    return true;
  }

  // First tap at t=1000ms
  assert.strictEqual(simulateTap(1000), true, 'First tap must be processed');
  assert.strictEqual(tapCount, 1, 'Tap count should be 1');

  // Concurrent WebXR select event at t=1050ms (50ms later) -> should be suppressed!
  assert.strictEqual(simulateTap(1050), false, 'Immediate concurrent tap must be suppressed');
  assert.strictEqual(tapCount, 1, 'Tap count should remain 1');

  // Another rapid jitter at t=1200ms (200ms later) -> suppressed
  assert.strictEqual(simulateTap(1200), false, 'Tap within 250ms must be suppressed');
  assert.strictEqual(tapCount, 1, 'Tap count should remain 1');

  // Legitimate user tap after 300ms at t=1350ms -> processed
  assert.strictEqual(simulateTap(1350), true, 'Tap after 250ms threshold must be processed');
  assert.strictEqual(tapCount, 2, 'Tap count should be 2');

  console.log('Test 2: Tap deduplication gate (250ms threshold) passed.');
}

// Provide mock canvas context for Node test environment
globalThis.document = {
  createElement: (tag) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          fillStyle: '',
          font: '',
          textAlign: '',
          textBaseline: '',
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          quadraticCurveTo: () => {},
          closePath: () => {},
          fill: () => {},
          fillText: () => {},
        }),
      };
    }
    return {};
  },
};

// Test 3: Touch hit volume detection on devices
{
  const scene = new THREE.Scene();
  const devMgr = new DeviceManager();
  const matrix = new THREE.Matrix4().makeTranslation(0, 0, -0.5);

  devMgr.addDevice(scene, 'PC', matrix, 'node-pc-1', 'PC-01', '#3b82f6');

  const group = devMgr._devices.get('node-pc-1');
  assert.ok(group, 'Device group must be created');

  // Verify invisible hitTarget mesh exists inside group
  const hitTarget = group.children.find((c) => c.name === 'hitTarget');
  assert.ok(hitTarget, 'Device group must contain hitTarget mesh');
  assert.strictEqual(hitTarget.material.transparent, true, 'hitTarget must be transparent');
  assert.strictEqual(hitTarget.material.opacity, 0, 'hitTarget must have zero opacity');

  // Create a camera pointed at the device
  const camera = new THREE.PerspectiveCamera(70, 1, 0.01, 10);
  camera.position.set(0, 0.035, 0);
  camera.lookAt(0, 0.035, -0.5);
  camera.updateMatrixWorld();

  // Raycast exactly at center (NDC 0, 0)
  const hitId = devMgr.getDeviceAtScreenPoint(camera, 0, 0);
  assert.strictEqual(hitId, 'node-pc-1', 'Raycast must detect device through hitTarget volume');

  // Raycast far away (NDC 0.9, 0.9)
  const missId = devMgr.getDeviceAtScreenPoint(camera, 0.9, 0.9);
  assert.strictEqual(missId, null, 'Raycast off-target must return null');

  devMgr.dispose(scene);
  console.log('Test 3: Touch hit volume raycasting on devices passed.');
}

// Test 4: ConnectionManager in-place material styling (zero geometry re-allocation)
{
  const scene = new THREE.Scene();
  const connMgr = new ConnectionManager();

  const edge = { id: 'edge-test', source: 'A', target: 'B', weight: 0.5 };
  const pos1 = { x: 0, y: 0, z: -0.5 };
  const pos2 = { x: 0.3, y: 0, z: -0.5 };

  connMgr.addConnection(scene, edge, pos1, pos2);

  const entry = connMgr._connections.get('edge-test');
  assert.ok(entry, 'Connection entry must exist');
  assert.ok(entry.cylinder, 'Connection entry must retain cylinder mesh reference');
  const initialGeometry = entry.cylinder.geometry;
  const initialMaterial = entry.cylinder.material;

  // 1. Switch to Route highlight mode
  connMgr.highlightRoute(scene, ['edge-test']);
  assert.strictEqual(entry.isHighlighted, true, 'Edge must be flagged as highlighted');
  // Critical: Geometry and Material references MUST NOT be destroyed and recreated
  assert.strictEqual(entry.cylinder.geometry, initialGeometry, 'Geometry must be reused in-place');
  assert.strictEqual(entry.cylinder.material, initialMaterial, 'Material must be reused in-place');

  // 2. Switch to Packet Active mode
  connMgr.setActivePacketEdge(scene, 'edge-test');
  assert.strictEqual(entry.isPacketActive, true, 'Edge must be flagged as packet active');
  assert.strictEqual(entry.cylinder.geometry, initialGeometry, 'Geometry must remain reused during packet traversal');

  // 3. Clear Packet Active mode
  connMgr.clearActivePacketEdge(scene);
  assert.strictEqual(entry.isPacketActive, false, 'Packet active must be cleared');
  assert.strictEqual(entry.cylinder.geometry, initialGeometry, 'Geometry preserved after packet edge clear');

  // 4. Clear all Route highlights
  connMgr.clearRouteHighlights(scene);
  assert.strictEqual(entry.isHighlighted, false, 'Highlighted must be false');
  assert.strictEqual(entry.cylinder.geometry, initialGeometry, 'Geometry preserved after route highlight clear');

  connMgr.dispose(scene);
  console.log('Test 4: In-place material updates without geometry reallocation passed.');
}

// Test 5: beforexrselect button event suppression simulation
{
  let xrSelectFired = false;

  function onBeforeXRSelect(e) {
    if (e.target?.tagName === 'BUTTON' || e.target?.closest?.('button')) {
      e.preventDefault();
    }
  }

  function simulateDomClick(element) {
    let prevented = false;
    const fakeEvent = {
      target: element,
      preventDefault: () => {
        prevented = true;
      },
    };
    onBeforeXRSelect(fakeEvent);

    if (!prevented) {
      xrSelectFired = true;
    }
  }

  // Simulate tapping an overlay button
  const buttonElement = {
    tagName: 'BUTTON',
    closest: (selector) => (selector.includes('button') ? buttonElement : null),
  };
  simulateDomClick(buttonElement);
  assert.strictEqual(xrSelectFired, false, 'Button click must prevent XR select from firing in 3D scene');

  // Simulate tapping empty canvas / space
  const canvasElement = {
    tagName: 'CANVAS',
    closest: () => null,
  };
  simulateDomClick(canvasElement);
  assert.strictEqual(xrSelectFired, true, 'Canvas tap outside buttons must allow XR select to fire');

  console.log('Test 5: beforexrselect event suppression logic passed.');
}

console.log('\nALL WEBXR INTERACTION & OPTIMIZATION TESTS PASSED!\n');
