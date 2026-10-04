import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBbox, isValidNormalizedBbox } from '../server/utils/geometry.js';

describe('Bounding Box Normalization and Geometry Validation', () => {
  test('normalizes standard percentage bounding box', () => {
    const raw = { x: 15.4, y: 22.8, width: 34.5, height: 40.2 };
    const normalized = normalizeBbox(raw);
    assert.deepEqual(normalized, { x: 15.4, y: 22.8, width: 34.5, height: 40.2 });
    assert.equal(isValidNormalizedBbox(normalized), true);
  });

  test('fixes negative coordinates (e.g. y: -13) and clamps to safe bounds', () => {
    const invalidRaw = { x: 18, y: -13, width: 7, height: 16 };
    const normalized = normalizeBbox(invalidRaw);
    assert.equal(normalized.y >= 0, true);
    assert.equal(normalized.x, 18);
    assert.equal(normalized.y, 0);
    assert.equal(isValidNormalizedBbox(normalized), true);
  });

  test('clamps bounding boxes that exceed image boundaries', () => {
    const overflowing = { x: 85, y: 90, width: 30, height: 25 };
    const normalized = normalizeBbox(overflowing);
    assert.equal(normalized.x + normalized.width <= 100.01, true);
    assert.equal(normalized.y + normalized.height <= 100.01, true);
    assert.equal(isValidNormalizedBbox(normalized), true);
  });

  test('converts unit-ratio coordinates (0.0 to 1.0) into percentages (0 to 100)', () => {
    const ratioBbox = { x: 0.12, y: 0.25, width: 0.45, height: 0.50 };
    const normalized = normalizeBbox(ratioBbox);
    assert.equal(normalized.x, 12);
    assert.equal(normalized.y, 25);
    assert.equal(normalized.width, 45);
    assert.equal(normalized.height, 50);
    assert.equal(isValidNormalizedBbox(normalized), true);
  });

  test('converts pixel coordinates given image dimensions', () => {
    const pixelBbox = { x: 320, y: 240, width: 160, height: 120 };
    const imageDims = { width: 640, height: 480 };
    const normalized = normalizeBbox(pixelBbox, imageDims);
    assert.equal(normalized.x, 50);
    assert.equal(normalized.y, 50);
    assert.equal(normalized.width, 25);
    assert.equal(normalized.height, 25);
    assert.equal(isValidNormalizedBbox(normalized), true);
  });

  test('handles 4-element corner array [x1, y1, x2, y2]', () => {
    const cornerArr = [10, 20, 40, 60];
    const normalized = normalizeBbox(cornerArr);
    assert.equal(normalized.x, 10);
    assert.equal(normalized.y, 20);
    assert.equal(normalized.width, 30);
    assert.equal(normalized.height, 40);
    assert.equal(isValidNormalizedBbox(normalized), true);
  });

  test('rejects non-numeric bounding boxes', () => {
    assert.throws(() => normalizeBbox({ x: 'invalid', y: 10, width: 20, height: 20 }), /valid numbers/);
    assert.throws(() => normalizeBbox(null), /null or undefined/);
  });
});
