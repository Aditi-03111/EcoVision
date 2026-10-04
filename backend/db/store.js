import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { MongoClient, ObjectId } from 'mongodb';
import { validateEvent, formatEventDocument, EVENT_SCHEMA_VERSION } from '../schemas/event.js';
import { validateAnimal, formatAnimalDocument, ANIMAL_SCHEMA_VERSION } from '../schemas/animal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDataDir = path.resolve(__dirname, '../../data');

export async function createStore(customDataDir = null) {
  if (process.env.MONGODB_URI) {
    return createMongoStore();
  }
  return createJsonStore(customDataDir || defaultDataDir);
}

export async function createMongoStore(mongoUri = process.env.MONGODB_URI, dbName = process.env.MONGODB_DB || 'ecovision') {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);
  const events = db.collection('events');
  const animals = db.collection('animals');
  await events.createIndex({ timestamp: -1 });
  await animals.createIndex({ identity: 1 }, { unique: true });

  return {
    type: 'mongodb',
    async listEvents(filter = {}) {
      const query = {};
      if (filter.reviewStatus) query.reviewStatus = filter.reviewStatus;
      if (filter.threatLevel) query.threatLevel = filter.threatLevel;
      return events.find(query).sort({ timestamp: -1 }).toArray();
    },
    async createEvent(eventData) {
      const formatted = formatEventDocument(eventData);
      validateEvent(formatted);
      const result = await events.insertOne(formatted);
      return { ...formatted, _id: result.insertedId.toString() };
    },
    async getEventById(id) {
      try {
        const _id = new ObjectId(id);
        return await events.findOne({ _id });
      } catch {
        return null;
      }
    },
    async updateReviewStatus(id, reviewStatus) {
      try {
        const _id = new ObjectId(id);
        const allowed = ['pending', 'reviewed', 'confirmed'];
        if (!allowed.includes(reviewStatus)) {
          throw new Error(`Invalid reviewStatus: ${reviewStatus}`);
        }
        await events.updateOne({ _id }, { $set: { reviewStatus, updatedAt: new Date().toISOString() } });
        return await events.findOne({ _id });
      } catch (err) {
        if (err.message.startsWith('Invalid reviewStatus')) throw err;
        return null;
      }
    },
    async listAnimals() {
      return animals.find({}).toArray();
    },
    async upsertAnimal(record) {
      const formatted = formatAnimalDocument(record);
      validateAnimal(formatted);
      await animals.updateOne({ identity: formatted.identity }, { $set: formatted }, { upsert: true });
      return animals.findOne({ identity: formatted.identity });
    },
    async close() {
      await client.close();
    }
  };
}

export async function createJsonStore(targetDataDir = defaultDataDir) {
  await fs.mkdir(targetDataDir, { recursive: true });
  const eventsFile = path.join(targetDataDir, 'events.json');
  const animalsFile = path.join(targetDataDir, 'animals.json');

  await ensureJson(eventsFile, getSeededEvents);
  await ensureJson(animalsFile, getSeededAnimals);

  return {
    type: 'json',
    async listEvents(filter = {}) {
      const events = await readJson(eventsFile);
      let filtered = events;
      if (filter.reviewStatus) filtered = filtered.filter(e => e.reviewStatus === filter.reviewStatus);
      if (filter.threatLevel) filtered = filtered.filter(e => e.threatLevel === filter.threatLevel);
      return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    async createEvent(eventData) {
      const formatted = formatEventDocument(eventData);
      validateEvent(formatted);
      const events = await readJson(eventsFile);
      const saved = { ...formatted, _id: crypto.randomUUID() };
      events.unshift(saved);
      await writeJson(eventsFile, events);
      return saved;
    },
    async getEventById(id) {
      const events = await readJson(eventsFile);
      return events.find((event) => event._id === id) || null;
    },
    async updateReviewStatus(id, reviewStatus) {
      const allowed = ['pending', 'reviewed', 'confirmed'];
      if (!allowed.includes(reviewStatus)) {
        throw new Error(`Invalid reviewStatus: ${reviewStatus}`);
      }
      const events = await readJson(eventsFile);
      const index = events.findIndex((event) => event._id === id);
      if (index === -1) return null;
      events[index] = {
        ...events[index],
        reviewStatus,
        updatedAt: new Date().toISOString()
      };
      await writeJson(eventsFile, events);
      return events[index];
    },
    async listAnimals() {
      return readJson(animalsFile);
    },
    async upsertAnimal(record) {
      const formatted = formatAnimalDocument(record);
      validateAnimal(formatted);
      const animals = await readJson(animalsFile);
      const index = animals.findIndex((animal) => animal.identity === formatted.identity);
      if (index >= 0) {
        animals[index] = { ...animals[index], ...formatted, sightingCount: (animals[index].sightingCount || 1) + 1 };
      } else {
        animals.push(formatted);
      }
      await writeJson(animalsFile, animals);
      return formatted;
    },
    async resetSeedData() {
      await writeJson(eventsFile, getSeededEvents());
      await writeJson(animalsFile, getSeededAnimals());
    }
  };
}

async function ensureJson(file, fallbackFn) {
  try {
    await fs.access(file);
    const content = await fs.readFile(file, 'utf8');
    if (!content.trim()) throw new Error('Empty file');
    JSON.parse(content);
  } catch {
    await writeJson(file, fallbackFn());
  }
}

async function readJson(file) {
  const content = await fs.readFile(file, 'utf8');
  return JSON.parse(content);
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function getSeededAnimals() {
  return [
    {
      schemaVersion: ANIMAL_SCHEMA_VERSION,
      identity: 'TGR-014',
      species: 'Tiger',
      embedding: [0.92, 0.42, 0.19, 0.74, 0.34, 0.61],
      lastSeen: '2026-08-18T21:44:00.000Z',
      sightingCount: 14,
      notes: ['Identified by distinct right flank stripe pattern.'],
      createdAt: '2026-08-01T10:00:00.000Z',
      updatedAt: '2026-08-18T21:44:00.000Z'
    },
    {
      schemaVersion: ANIMAL_SCHEMA_VERSION,
      identity: 'ELP-003',
      species: 'Elephant',
      embedding: [0.22, 0.82, 0.54, 0.41, 0.77, 0.28],
      lastSeen: '2026-07-30T02:14:00.000Z',
      sightingCount: 8,
      notes: ['Mature bull elephant with asymmetric left tusk.'],
      createdAt: '2026-07-15T08:30:00.000Z',
      updatedAt: '2026-07-30T02:14:00.000Z'
    },
    {
      schemaVersion: ANIMAL_SCHEMA_VERSION,
      identity: 'RNO-021',
      species: 'Rhino',
      embedding: [0.57, 0.31, 0.88, 0.15, 0.66, 0.47],
      lastSeen: '2026-09-02T17:20:00.000Z',
      sightingCount: 5,
      notes: ['One-horned rhino tagged in Sanctuary Sector 3.'],
      createdAt: '2026-08-10T12:00:00.000Z',
      updatedAt: '2026-09-02T17:20:00.000Z'
    }
  ];
}

export function getSeededEvents() {
  return [
    {
      schemaVersion: EVENT_SCHEMA_VERSION,
      _id: 'seed-event-001',
      imagePath: '/uploads/ecovision-tiger-poach-sample.jpg',
      originalName: 'tiger-perimeter-check.jpg',
      location: 'East Gate Camera 02',
      timestamp: '2026-09-24T18:45:00.000Z',
      cameraType: 'infrared',
      preprocessing: {
        method: 'OpenCV-CLAHE',
        mode: 'night_infrared_normalized',
        clipLimit: 2.0,
        tileGridSize: [8, 8],
        contrastScore: 0.82,
        meanLuminance: 46.2,
        imageHash: 'a79eb19a5ca1bd283f74fff104dd749cdb2364e447a5e0c2369338a8ae76107e'
      },
      detections: [
        {
          id: 'human-1',
          label: 'human',
          species: 'Homo sapiens',
          confidence: 0.88,
          bbox: { x: 18.0, y: 19.0, width: 25.0, height: 48.0 },
          model: 'YOLOv8n-8.4.172'
        },
        {
          id: 'animal-1',
          label: 'animal',
          species: 'Tiger',
          confidence: 0.94,
          bbox: { x: 52.0, y: 35.0, width: 38.0, height: 50.0 },
          model: 'YOLOv8n-8.4.172',
          reid: {
            identity: 'TGR-014',
            species: 'Tiger',
            status: 'known',
            similarity: 0.95,
            embeddingModel: 'SiameseNet-adapter'
          }
        }
      ],
      animalIdentity: {
        identity: 'TGR-014',
        species: 'Tiger',
        status: 'known',
        similarity: 0.95
      },
      identityStatus: 'known',
      threatLevel: 'high',
      reviewStatus: 'pending',
      inferenceMetadata: {
        modelVersion: 'yolov8n-8.4.172',
        confidenceThreshold: 0.20,
        processingTimeMs: 142.5,
        device: 'CPU'
      },
      rawInference: [
        { rawLabel: 'person', confidence: 0.88, bbox: { x: 18.0, y: 19.0, width: 25.0, height: 48.0 } },
        { rawLabel: 'cat', confidence: 0.94, bbox: { x: 52.0, y: 35.0, width: 38.0, height: 50.0 } }
      ],
      notes: [],
      createdAt: '2026-09-24T18:45:10.000Z',
      updatedAt: '2026-09-24T18:45:10.000Z'
    },
    {
      schemaVersion: EVENT_SCHEMA_VERSION,
      _id: 'seed-event-002',
      imagePath: '/uploads/elephant-waterhole-sample.jpg',
      originalName: 'elephant-waterhole-04.jpg',
      location: 'North Waterhole 04',
      timestamp: '2026-09-23T14:15:00.000Z',
      cameraType: 'daylight',
      preprocessing: {
        method: 'OpenCV-CLAHE',
        mode: 'daylight_normalized',
        clipLimit: 2.0,
        tileGridSize: [8, 8],
        contrastScore: 0.65,
        meanLuminance: 142.8,
        imageHash: 'f482d8c392aa0c4627d28716b5e02874bc29a8a7164b4c73919e8cf1b3d5402a'
      },
      detections: [
        {
          id: 'animal-1',
          label: 'animal',
          species: 'Elephant',
          confidence: 0.96,
          bbox: { x: 22.0, y: 25.0, width: 55.0, height: 60.0 },
          model: 'YOLOv8n-8.4.172',
          reid: {
            identity: 'ELP-003',
            species: 'Elephant',
            status: 'known',
            similarity: 0.98,
            embeddingModel: 'SiameseNet-adapter'
          }
        }
      ],
      animalIdentity: {
        identity: 'ELP-003',
        species: 'Elephant',
        status: 'known',
        similarity: 0.98
      },
      identityStatus: 'known',
      threatLevel: 'low',
      reviewStatus: 'confirmed',
      inferenceMetadata: {
        modelVersion: 'yolov8n-8.4.172',
        confidenceThreshold: 0.30,
        processingTimeMs: 128.0,
        device: 'CPU'
      },
      rawInference: [
        { rawLabel: 'elephant', confidence: 0.96, bbox: { x: 22.0, y: 25.0, width: 55.0, height: 60.0 } }
      ],
      notes: ['Confirmed as resident herd patriarch ELP-003.'],
      createdAt: '2026-09-23T14:15:15.000Z',
      updatedAt: '2026-09-23T14:30:00.000Z'
    }
  ];
}
