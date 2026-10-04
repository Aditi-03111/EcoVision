import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateEvent, formatEventDocument, EVENT_SCHEMA_VERSION } from '../server/schemas/event.js';
import { validateAnimal, formatAnimalDocument, ANIMAL_SCHEMA_VERSION } from '../server/schemas/animal.js';

describe('Event & Animal Schema Validation & Versioning', () => {
  test('validates and formats a complete event document with version 1.0.0', () => {
    const rawEvent = {
      imagePath: '/uploads/test.jpg',
      originalName: 'tiger_test.jpg',
      location: 'South Ridge Cam 01',
      timestamp: '2026-09-30T10:00:00.000Z',
      detections: [
        {
          id: 'animal-1',
          label: 'animal',
          confidence: 0.92,
          bbox: { x: 10, y: 15, width: 30, height: 40 }
        }
      ]
    };

    const formatted = formatEventDocument(rawEvent);
    assert.equal(formatted.schemaVersion, EVENT_SCHEMA_VERSION);
    assert.equal(formatted.reviewStatus, 'pending');
    assert.equal(formatted.threatLevel, 'low');
    assert.equal(validateEvent(formatted), true);
  });

  test('rejects event with invalid bounding box geometry', () => {
    const invalidEvent = {
      imagePath: '/uploads/test.jpg',
      originalName: 'tiger_test.jpg',
      location: 'South Ridge Cam 01',
      timestamp: '2026-09-30T10:00:00.000Z',
      detections: [
        {
          id: 'animal-1',
          label: 'animal',
          confidence: 0.92,
          bbox: { x: 10, y: -5, width: 30, height: 40 } // negative y
        }
      ]
    };
    assert.throws(() => validateEvent(invalidEvent), /Invalid detection bounding box geometry/);
  });

  test('rejects event with invalid review status', () => {
    const invalidEvent = {
      imagePath: '/uploads/test.jpg',
      originalName: 'test.jpg',
      location: 'Camera 01',
      timestamp: '2026-09-30T10:00:00.000Z',
      reviewStatus: 'unauthorized_status',
      detections: []
    };
    assert.throws(() => validateEvent(invalidEvent), /Invalid reviewStatus/);
  });

  test('validates and formats animal document with schema version 1.0.0', () => {
    const rawAnimal = {
      identity: 'TGR-099',
      species: 'Tiger',
      embedding: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
      lastSeen: '2026-09-30T10:00:00.000Z'
    };

    const formatted = formatAnimalDocument(rawAnimal);
    assert.equal(formatted.schemaVersion, ANIMAL_SCHEMA_VERSION);
    assert.equal(formatted.sightingCount, 1);
    assert.equal(validateAnimal(formatted), true);
  });

  test('rejects animal without identity or invalid embedding', () => {
    assert.throws(() => validateAnimal({ species: 'Tiger' }), /Animal must have a valid string identity/);
    assert.throws(
      () => validateAnimal({ identity: 'TGR-099', species: 'Tiger', embedding: 'invalid_string' }),
      /Animal embedding must be an array/
    );
  });
});
