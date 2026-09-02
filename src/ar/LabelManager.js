/**
 * ARNetLab — LabelManager
 *
 * Creates sprite-based text labels that float above placed devices.
 * Uses canvas-generated textures for maximum performance.
 *
 * Responsibilities:
 * - Create a THREE.Sprite with pre-rendered text per device
 * - Position above each device
 * - Remove/dispose labels when devices are removed
 */

import * as THREE from 'three';

const LABEL_Y_OFFSET = 0.06; // meters above device origin
const LABEL_SCALE = 0.04;    // sprite scale in world units

/**
 * Create a text label sprite.
 * @param {string} text — e.g. "PC-01"
 * @param {string} colorHex — e.g. "#3b82f6"
 * @returns {THREE.Sprite}
 */
export function createLabelSprite(text, colorHex = '#ffffff') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 256;
  canvas.height = 64;

  // Background pill
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  _roundRect(ctx, 4, 4, 248, 56, 16);
  ctx.fill();

  // Colored left accent bar
  ctx.fillStyle = colorHex;
  _roundRect(ctx, 4, 4, 8, 56, 4);
  ctx.fill();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 34);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    sizeAttenuation: true,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(LABEL_SCALE, LABEL_SCALE * 0.25, 1);
  sprite.position.y = LABEL_Y_OFFSET;

  // Store canvas ref for disposal
  sprite.userData._labelCanvas = canvas;

  return sprite;
}

/**
 * Dispose a label sprite and its texture.
 * @param {THREE.Sprite} sprite
 */
export function disposeLabelSprite(sprite) {
  if (sprite.material) {
    if (sprite.material.map) {
      sprite.material.map.dispose();
    }
    sprite.material.dispose();
  }
}

/**
 * Draw a rounded rectangle path.
 */
function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
