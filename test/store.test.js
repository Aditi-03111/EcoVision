import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createJsonStore, getSeededEvents, getSeededAnimals } from '../backend/db/store.js';
import { isValidNormalizedBbox } from '../backend/utils/geometry.js';
import { validateEvent } from '../backend/schemas/event.js';
import { validateAnimal } from '../backend/schemas/animal.js';

describe('Data Stores and Seed Data Integrity', () => {
  let tmpDir;
  let store;

  before(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ecovision-test-'));
    store = await createJsonStore(tmpDir);
  });

  after(async () => {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });

  test('seeded events pass schema validation and contain no invalid geometries', () => {
    const seeds = getSeededEvents();
    assert.equal(seeds.length > 0, true);
    for (const event of seeds) {
      assert.equal(validateEvent(event), true);
      assert.equal(event.schemaVersion, '1.0.0');
      for (const det of event.detections) {
        assert.equal(isValidNormalizedBbox(det.bbox), true);
        assert.equal(det.bbox.x >= 0 && det.bbox.x <= 100, true);
        assert.equal(det.bbox.y >= 0 && det.bbox.y <= 100, true);
        assert.equal(det.bbox.x + det.bbox.width <= 100.01, true);
        assert.equal(det.bbox.y + det.bbox.height <= 100.01, true);
      }
    }
  });

  test('seeded animals pass schema validation', () => {
    const animals = getSeededAnimals();
    assert.equal(animals.length > 0, true);
    for (const animal of animals) {
      assert.equal(validateAnimal(animal), true);
      assert.equal(animal.schemaVersion, '1.0.0');
    }
  });

  test('creates new event with auto-generated id and schema version', async () => {
    const created = await store.createEvent({
      imagePath: '/uploads/unit_test.jpg',
      originalName: 'rhino_sighting.jpg',
      location: 'Sector 5 Waterhole',
      timestamp: new Date().toISOString(),
      detections: [
        {
          id: 'animal-1',
          label: 'animal',
          confidence: 0.93,
          bbox: { x: 20, y: 30, width: 40, height: 40 }
        }
      ]
    });

    assert.ok(created._id);
    assert.equal(created.schemaVersion, '1.0.0');
    assert.equal(created.location, 'Sector 5 Waterhole');
    assert.equal(created.reviewStatus, 'pending');

    const listed = await store.listEvents();
    const found = listed.find(e => e._id === created._id);
    assert.ok(found);
  });

  test('updates review status successfully', async () => {
    const events = await store.listEvents();
    const target = events[0];
    const updated = await store.updateReviewStatus(target._id, 'confirmed');
    assert.equal(updated.reviewStatus, 'confirmed');
    assert.ok(updated.updatedAt);
  });

  test('rejects invalid review status update', async () => {
    const events = await store.listEvents();
    const target = events[0];
    await assert.rejects(
      async () => store.updateReviewStatus(target._id, 'invalid_status_xyz'),
      /Invalid reviewStatus/
    );
  });

  test('returns null when updating non-existent event', async () => {
    const res = await store.updateReviewStatus('non-existent-id-9999', 'confirmed');
    assert.equal(res, null);
  });

  test('upserts animal identity and tracks sighting counts', async () => {
    const animal = {
      identity: 'TGR-TEST-01',
      species: 'Tiger',
      embedding: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
      lastSeen: new Date().toISOString()
    };

    const firstUpsert = await store.upsertAnimal(animal);
    assert.equal(firstUpsert.identity, 'TGR-TEST-01');

    const secondUpsert = await store.upsertAnimal({ ...animal, lastSeen: new Date().toISOString() });
    assert.equal(secondUpsert.identity, 'TGR-TEST-01');

    const animals = await store.listAnimals();
    const saved = animals.find(a => a.identity === 'TGR-TEST-01');
    assert.ok(saved);
    assert.equal(saved.sightingCount, 2);
  });
});
