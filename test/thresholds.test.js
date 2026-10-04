import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getDetectionThreshold,
  getAllThresholds,
  updateThresholds,
  resetThresholds
} from '../server/config/thresholds.js';

describe('Configurable Detection Thresholds by Species and Camera Type', () => {
  beforeEach(() => {
    resetThresholds();
  });

  test('resolves default global threshold when no species or camera specified', () => {
    const t = getDetectionThreshold();
    assert.equal(t, 0.25);
  });

  test('resolves camera-specific threshold', () => {
    const daylight = getDetectionThreshold({ cameraType: 'daylight' });
    const infrared = getDetectionThreshold({ cameraType: 'infrared' });
    const covert = getDetectionThreshold({ cameraType: 'covert' });
    assert.equal(daylight, 0.30);
    assert.equal(infrared, 0.20);
    assert.equal(covert, 0.18);
  });

  test('resolves species-specific threshold over camera threshold', () => {
    const tiger = getDetectionThreshold({ cameraType: 'infrared', species: 'tiger' });
    const elephant = getDetectionThreshold({ cameraType: 'daylight', species: 'elephant' });
    assert.equal(tiger, 0.35);
    assert.equal(elephant, 0.30);
  });

  test('respects explicit threshold override', () => {
    const custom = getDetectionThreshold({
      cameraType: 'daylight',
      species: 'tiger',
      override: 0.55
    });
    assert.equal(custom, 0.55);
  });

  test('updates thresholds dynamically and validates ranges', () => {
    updateThresholds({
      global: 0.32,
      cameraTypes: { infrared: 0.22 },
      species: { tiger: 0.40 }
    });

    assert.equal(getDetectionThreshold(), 0.32);
    assert.equal(getDetectionThreshold({ cameraType: 'infrared' }), 0.22);
    assert.equal(getDetectionThreshold({ species: 'tiger' }), 0.40);

    assert.throws(() => updateThresholds({ global: 1.5 }), /between 0.05 and 0.95/);
  });
});
