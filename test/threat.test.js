import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { classifyThreat } from '../backend/index.js';

describe('Threat Classification Logic', () => {
  test('returns "high" threat when both animal and human are detected (poaching scenario)', () => {
    const detections = [
      { id: '1', label: 'human', confidence: 0.89 },
      { id: '2', label: 'animal', confidence: 0.94 }
    ];
    assert.equal(classifyThreat(detections), 'high');
  });

  test('returns "high" threat when both animal and vehicle are detected', () => {
    const detections = [
      { id: '1', label: 'vehicle', confidence: 0.85 },
      { id: '2', label: 'animal', confidence: 0.91 }
    ];
    assert.equal(classifyThreat(detections), 'high');
  });

  test('returns "medium" threat when human is detected without animals (unauthorized intrusion)', () => {
    const detections = [
      { id: '1', label: 'human', confidence: 0.88 }
    ];
    assert.equal(classifyThreat(detections), 'medium');
  });

  test('returns "medium" threat when vehicle is detected without animals', () => {
    const detections = [
      { id: '1', label: 'vehicle', confidence: 0.82 }
    ];
    assert.equal(classifyThreat(detections), 'medium');
  });

  test('returns "low" threat for standard wildlife-only sightings', () => {
    const detections = [
      { id: '1', label: 'animal', confidence: 0.96 }
    ];
    assert.equal(classifyThreat(detections), 'low');
  });

  test('returns "low" threat for empty detections or background noise', () => {
    assert.equal(classifyThreat([]), 'low');
    assert.equal(classifyThreat(null), 'low');
  });
});
