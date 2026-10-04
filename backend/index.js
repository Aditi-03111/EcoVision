import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createStore } from './db/store.js';
import { preprocessImage } from './services/preprocess.js';
import { detectObjects } from './services/detection.js';
import { identifyAnimals } from './services/reid.js';
import { VALID_REVIEW_STATUSES, VALID_CAMERA_TYPES } from './schemas/event.js';
import { getAllThresholds, updateThresholds, resetThresholds } from './config/thresholds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const uploadsDir = path.join(rootDir, 'uploads');

await fs.mkdir(uploadsDir, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/tiff'
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const err = new Error('Invalid file format. Allowed formats: JPEG, PNG, WebP, BMP, TIFF.');
      err.code = 'INVALID_FILE_TYPE';
      cb(err);
    }
  }
});

export const app = express();
export const store = await createStore();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'EcoVision API',
    schemaVersion: '1.0.0',
    storeType: store.type
  });
});

app.get('/api/events', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.reviewStatus = req.query.status;
    if (req.query.threat) filter.threatLevel = req.query.threat;
    const events = await store.listEvents(filter);
    res.json(events);
  } catch (err) {
    next(err);
  }
});

app.get('/api/events/:id', async (req, res, next) => {
  try {
    const event = await store.getEventById(req.params.id);
    if (!event) {
      res.status(404).json({ error: 'Detection event not found.' });
      return;
    }
    res.json(event);
  } catch (err) {
    next(err);
  }
});

app.get('/api/summary', async (_req, res, next) => {
  try {
    const events = await store.listEvents();
    const summary = events.reduce(
      (acc, event) => {
        acc.total += 1;
        if (event.threatLevel === 'high') acc.highThreat += 1;
        if (event.threatLevel === 'medium') acc.mediumThreat += 1;
        if (event.reviewStatus === 'pending') acc.pending += 1;
        if (event.identityStatus === 'known') acc.knownAnimals += 1;
        return acc;
      },
      { total: 0, highThreat: 0, mediumThreat: 0, pending: 0, knownAnimals: 0 }
    );
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

app.post('/api/upload', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'File size exceeds maximum limit of 15MB.' });
        return;
      }
      res.status(400).json({ error: err.message || 'File upload error.' });
      return;
    }
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required.' });
      return;
    }

    const location = (req.body.location?.trim()) || 'Unspecified camera trap';
    let timestamp = req.body.timestamp;
    if (timestamp) {
      const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/i;
      const parsed = new Date(timestamp);
      if (isNaN(parsed.getTime()) || !isoRegex.test(timestamp)) {
        res.status(400).json({ error: 'Invalid timestamp format. Must be a valid ISO date/time string.' });
        return;
      }
      timestamp = parsed.toISOString();
    } else {
      timestamp = new Date().toISOString();
    }

    const cameraType = (req.body.cameraType?.trim().toLowerCase()) || 'standard';
    if (!VALID_CAMERA_TYPES.includes(cameraType)) {
      res.status(400).json({
        error: `Invalid cameraType: "${cameraType}". Allowed: ${VALID_CAMERA_TYPES.join(', ')}`
      });
      return;
    }

    let thresholdOverride = null;
    if (req.body.threshold) {
      const t = parseFloat(req.body.threshold);
      if (isNaN(t) || t < 0.05 || t > 0.95) {
        res.status(400).json({ error: 'Threshold override must be a number between 0.05 and 0.95.' });
        return;
      }
      thresholdOverride = t;
    }

    const originalName = req.file.originalname;
    const ext = path.extname(originalName) || '.jpg';
    const finalName = `${req.file.filename}${ext}`;
    const finalPath = path.join(uploadsDir, finalName);
    await fs.rename(req.file.path, finalPath);

    const input = {
      path: finalPath,
      publicPath: `/uploads/${finalName}`,
      originalName,
      location,
      timestamp,
      cameraType
    };

    // 1. Real OpenCV CLAHE Preprocessing
    const preprocessing = await preprocessImage(input);

    // 2. Real YOLOv8 Object Detection with normalized geometry and configurable thresholds
    const detectionResult = await detectObjects({
      ...input,
      preprocessing,
      cameraType,
      thresholdOverride
    });

    // 3. Animal Re-Identification and Taxonomy matching
    const reid = await identifyAnimals({
      detections: detectionResult.detections,
      image: input,
      store
    });

    const threatLevel = classifyThreat(reid.detections);

    // 4. Persist structured event with versioned schema & metadata
    const event = await store.createEvent({
      imagePath: input.publicPath,
      originalName,
      location,
      timestamp,
      cameraType,
      preprocessing,
      detections: reid.detections,
      animalIdentity: reid.primaryIdentity,
      identityStatus: reid.primaryIdentity?.status || 'not_applicable',
      threatLevel,
      reviewStatus: 'pending',
      inferenceMetadata: {
        modelVersion: detectionResult.modelVersion,
        confidenceThreshold: detectionResult.confidenceThreshold,
        processingTimeMs: detectionResult.processingTimeMs,
        device: detectionResult.device || 'CPU'
      },
      rawInference: detectionResult.rawInference,
      notes: []
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/events/:id/review', async (req, res, next) => {
  try {
    const { reviewStatus } = req.body;
    if (!VALID_REVIEW_STATUSES.includes(reviewStatus)) {
      res.status(400).json({
        error: `reviewStatus must be one of: ${VALID_REVIEW_STATUSES.join(', ')}.`
      });
      return;
    }

    const event = await store.updateReviewStatus(req.params.id, reviewStatus);
    if (!event) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
});

// Configurable detection threshold endpoints
app.get('/api/config/thresholds', (_req, res) => {
  res.json(getAllThresholds());
});

app.patch('/api/config/thresholds', (req, res, next) => {
  try {
    const updated = updateThresholds(req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/config/thresholds/reset', (_req, res) => {
  res.json(resetThresholds());
});

// Global error handler
app.use((error, _req, res, _next) => {
  console.error('[EcoVision API Error]', error);
  const status = error.status || error.statusCode || (error.message?.includes('validation') ? 422 : 500);
  res.status(status).json({
    error: error.message || 'Unexpected EcoVision server error.',
    status
  });
});

export function classifyThreat(detections) {
  if (!Array.isArray(detections) || detections.length === 0) return 'low';
  const hasHuman = detections.some((detection) => detection.label === 'human');
  const hasVehicle = detections.some((detection) => detection.label === 'vehicle');
  const hasAnimal = detections.some((detection) => detection.label === 'animal');

  if ((hasHuman || hasVehicle) && hasAnimal) return 'high';
  if (hasHuman || hasVehicle) return 'medium';
  return 'low';
}

const port = process.env.PORT || 4000;
const host = process.env.HOST || '127.0.0.1';

// Only start listener if invoked directly (not when imported in tests)
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectRun && process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, host, () => {
    console.log(`EcoVision API listening on http://${host}:${port}`);
  });

  server.on('error', (error) => {
    console.error(`EcoVision API failed to listen on ${host}:${port}`, error);
    process.exitCode = 1;
  });

  process.on('SIGTERM', () => server.close());
}
