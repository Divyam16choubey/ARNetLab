/**
 * Automated Unit Tests for AR Lifecycle, HitTest Stale Pose Prevention,
 * Connection Visuals, and Resource Disposal (Phase 6 Hardening).
 */

import assert from 'node:assert';
import * as THREE from 'three';
import { HitTestManager } from '../HitTestManager.js';
import { ConnectionManager } from '../ConnectionManager.js';
import { createLabelSprite, disposeLabelSprite } from '../LabelManager.js';
import { ReticleManager } from '../ReticleManager.js';
import { PlacementManager } from '../PlacementManager.js';

console.log('Running Phase 6 AR Lifecycle & Manager Tests...\n');

// Test 1: HitTestManager stale pose prevention
{
  const hitTest = new HitTestManager();
  assert.strictEqual(hitTest.getHitPoseMatrixCopy(), null, 'Initially pose copy must be null');

  // Simulate mock hit test source and fake frame with valid pose
  hitTest.hitTestSource = {};
  const fakeMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0.5, -0.2, -1.0, 1];
  const fakeFrameWithHit = {
    getHitTestResults: () => [
      {
        getPose: () => ({ transform: { matrix: new Float32Array(fakeMatrix) } }),
      },
    ],
  };

  const found = hitTest.update(fakeFrameWithHit, {});
  assert.strictEqual(found, true, 'Should find valid hit');
  assert.strictEqual(hitTest.hasHitResult, true, 'hasHitResult should be true');
  assert.notStrictEqual(hitTest.getHitPoseMatrixCopy(), null, 'Should return pose matrix copy');

  // Now simulate a frame with lost tracking (0 hit test results)
  const fakeFrameNoHit = {
    getHitTestResults: () => [],
  };

  const lost = hitTest.update(fakeFrameNoHit, {});
  assert.strictEqual(lost, false, 'Should report no hit found');
  assert.strictEqual(hitTest.hasHitResult, false, 'hasHitResult should be false');
  // CRITICAL: Must not leak stale pose from previous frame!
  assert.strictEqual(hitTest.getHitPoseMatrixCopy(), null, 'Must return null when tracking is lost (no stale pose)');

  hitTest.dispose();
  console.log('Test 1: HitTestManager stale pose prevention passed.');
}

// Test 2: ConnectionManager route and packet visual creation (no undeclared variables)
{
  const scene = new THREE.Scene();
  const connMgr = new ConnectionManager();

  const edge = { id: 'edge-1', source: 'node-A', target: 'node-B', weight: 1.5 };
  const pos1 = { x: 0, y: 0, z: 0 };
  const pos2 = { x: 1, y: 0, z: 0 };

  // 1. Add normal link
  connMgr.addConnection(scene, edge, pos1, pos2);
  assert.strictEqual(scene.children.length, 1, 'Scene should contain connection group');

  // 2. Highlight route
  connMgr.highlightRoute(scene, ['edge-1']);
  assert.strictEqual(scene.children.length, 1, 'Route highlight should replace normal link cleanly');

  // 3. Set active packet edge
  connMgr.setActivePacketEdge(scene, 'edge-1');
  assert.strictEqual(scene.children.length, 1, 'Active packet highlight should replace route cleanly');

  // 4. Clear active packet edge
  connMgr.clearActivePacketEdge(scene);
  assert.strictEqual(scene.children.length, 1, 'Clearing active packet link should restore route style');

  // 5. Clear all route highlights
  connMgr.clearRouteHighlights(scene);
  assert.strictEqual(scene.children.length, 1, 'Clearing route highlights should restore normal style');

  // 6. Clean disposal
  connMgr.dispose(scene);
  assert.strictEqual(scene.children.length, 0, 'Disposal should remove all visual links from scene');

  console.log('Test 2: ConnectionManager route and active packet styling passed.');
}

// Test 3: ReticleManager and PlacementManager parent detachment and disposal
{
  const scene = new THREE.Scene();
  const reticle = new ReticleManager();
  reticle.init(scene);
  assert.strictEqual(scene.children.length, 1, 'Reticle should be in scene');

  // Dispose with scene
  reticle.dispose(scene);
  assert.strictEqual(scene.children.length, 0, 'Reticle should be removed and disposed');
  assert.strictEqual(reticle.mesh, null, 'Mesh reference should be null');

  // PlacementManager
  const placement = new PlacementManager();
  const dummyMatrix = new THREE.Matrix4();
  placement.place(scene, dummyMatrix);
  assert.strictEqual(scene.children.length, 1, 'Placement anchor should be in scene');
  assert.strictEqual(placement.isPlaced, true, 'isPlaced should be true');

  // Dispose without explicit scene param (must safely detach via parent)
  placement.dispose();
  assert.strictEqual(scene.children.length, 0, 'Anchor must be removed from scene via parent');
  assert.strictEqual(placement.anchor, null, 'Anchor reference should be null');
  assert.strictEqual(placement.isPlaced, false, 'isPlaced should be false');

  console.log('Test 3: ReticleManager and PlacementManager disposal passed.');
}

// Test 4: LabelManager sprite texture and canvas release
{
  // Provide mock canvas context for Node environment
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

  const sprite = createLabelSprite('SWITCH-01', '#22c55e');
  assert.ok(sprite instanceof THREE.Sprite, 'Must return a Three.js Sprite');
  assert.ok(sprite.userData._labelCanvas, 'Must attach canvas to userData');

  const canvas = sprite.userData._labelCanvas;
  assert.strictEqual(canvas.width, 256, 'Initial canvas width 256');

  disposeLabelSprite(sprite);
  assert.strictEqual(canvas.width, 0, 'Canvas width must be reset to 0 to free backing store memory');
  assert.strictEqual(sprite.userData._labelCanvas, null, 'Canvas reference must be nullified');

  console.log('Test 4: LabelManager memory release passed.');
}

console.log('\nALL PHASE 6 AR LIFECYCLE & MANAGER TESTS PASSED!');
