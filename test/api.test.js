import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { app, store } from '../backend/index.js';

describe('EcoVision API Integration Endpoints', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('GET /api/health returns ok status and schema version', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.equal(data.schemaVersion, '1.0.0');
    assert.ok(data.storeType);
  });

  test('GET /api/events returns list of events with valid schema', async () => {
    const res = await fetch(`${baseUrl}/api/events`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(Array.isArray(data), true);
    assert.equal(data.length > 0, true);
    assert.ok(data[0].schemaVersion);
  });

  test('GET /api/summary returns event statistics breakdown', async () => {
    const res = await fetch(`${baseUrl}/api/summary`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(typeof data.total, 'number');
    assert.equal(typeof data.highThreat, 'number');
    assert.equal(typeof data.pending, 'number');
    assert.equal(typeof data.knownAnimals, 'number');
  });

  test('POST /api/upload returns 400 when image file is missing', async () => {
    const formData = new FormData();
    formData.append('location', 'Camera 01');

    const res = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /Image file is required/i);
  });

  test('POST /api/upload returns 400 when cameraType is invalid', async () => {
    const formData = new FormData();
    const fakeBlob = new Blob(['fake-image-bytes'], { type: 'image/jpeg' });
    formData.append('image', fakeBlob, 'test.jpg');
    formData.append('cameraType', 'non_existent_camera_type');

    const res = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /Invalid cameraType/i);
  });

  test('POST /api/upload returns 400 when timestamp is invalid', async () => {
    const formData = new FormData();
    const fakeBlob = new Blob(['fake-image-bytes'], { type: 'image/jpeg' });
    formData.append('image', fakeBlob, 'test.jpg');
    formData.append('timestamp', 'invalid-date-string-1234');

    const res = await fetch(`${baseUrl}/api/upload`, {
      method: 'POST',
      body: formData
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /Invalid timestamp format/i);
  });

  test('PATCH /api/events/:id/review updates review status', async () => {
    const events = await store.listEvents();
    const target = events[0];

    const res = await fetch(`${baseUrl}/api/events/${target._id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus: 'reviewed' })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.reviewStatus, 'reviewed');
  });

  test('PATCH /api/events/:id/review rejects invalid status', async () => {
    const events = await store.listEvents();
    const target = events[0];

    const res = await fetch(`${baseUrl}/api/events/${target._id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus: 'unknown_status' })
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.error, /reviewStatus must be one of/i);
  });

  test('PATCH /api/events/:id/review returns 404 for unknown event ID', async () => {
    const res = await fetch(`${baseUrl}/api/events/does-not-exist-9999/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus: 'confirmed' })
    });

    assert.equal(res.status, 404);
  });

  test('GET & PATCH /api/config/thresholds', async () => {
    const getRes = await fetch(`${baseUrl}/api/config/thresholds`);
    assert.equal(getRes.status, 200);
    const original = await getRes.json();
    assert.ok(original.cameraTypes);
    assert.ok(original.species);

    const patchRes = await fetch(`${baseUrl}/api/config/thresholds`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ global: 0.33 })
    });
    assert.equal(patchRes.status, 200);
    const updated = await patchRes.json();
    assert.equal(updated.global, 0.33);
  });
});
