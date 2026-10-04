export const EVENT_SCHEMA_VERSION = '1.0.0';

export const VALID_REVIEW_STATUSES = ['pending', 'reviewed', 'confirmed'];
export const VALID_THREAT_LEVELS = ['low', 'medium', 'high'];
export const VALID_IDENTITY_STATUSES = ['known', 'new', 'uncertain', 'not_applicable'];
export const VALID_CAMERA_TYPES = ['daylight', 'infrared', 'thermal', 'covert', 'standard'];

/**
 * Validates and normalizes an event document.
 * Throws an Error with descriptive message if validation fails.
 */
export function validateEvent(event) {
  if (!event || typeof event !== 'object') {
    throw new Error('Event must be a valid object.');
  }

  if (!event.imagePath || typeof event.imagePath !== 'string') {
    throw new Error('Event must have a valid string imagePath.');
  }

  if (!event.originalName || typeof event.originalName !== 'string') {
    throw new Error('Event must have a valid string originalName.');
  }

  if (!event.location || typeof event.location !== 'string') {
    throw new Error('Event must have a valid string location.');
  }

  const timestampDate = new Date(event.timestamp);
  if (!event.timestamp || isNaN(timestampDate.getTime())) {
    throw new Error('Event must have a valid ISO timestamp.');
  }

  if (event.reviewStatus && !VALID_REVIEW_STATUSES.includes(event.reviewStatus)) {
    throw new Error(`Invalid reviewStatus: "${event.reviewStatus}". Allowed: ${VALID_REVIEW_STATUSES.join(', ')}`);
  }

  if (event.threatLevel && !VALID_THREAT_LEVELS.includes(event.threatLevel)) {
    throw new Error(`Invalid threatLevel: "${event.threatLevel}". Allowed: ${VALID_THREAT_LEVELS.join(', ')}`);
  }

  if (event.identityStatus && !VALID_IDENTITY_STATUSES.includes(event.identityStatus)) {
    throw new Error(`Invalid identityStatus: "${event.identityStatus}". Allowed: ${VALID_IDENTITY_STATUSES.join(', ')}`);
  }

  if (!Array.isArray(event.detections)) {
    throw new Error('Event detections must be an array.');
  }

  for (const det of event.detections) {
    if (!det.id || typeof det.label !== 'string') {
      throw new Error('Each detection must have an id and label.');
    }
    if (typeof det.confidence !== 'number' || det.confidence < 0 || det.confidence > 1) {
      throw new Error(`Invalid detection confidence: ${det.confidence}. Must be between 0 and 1.`);
    }
    if (!det.bbox || typeof det.bbox !== 'object') {
      throw new Error('Each detection must have a valid bbox object.');
    }
    const { x, y, width, height } = det.bbox;
    if (
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      typeof width !== 'number' ||
      typeof height !== 'number' ||
      x < 0 || y < 0 || width <= 0 || height <= 0 ||
      x + width > 100.01 || y + height > 100.01
    ) {
      throw new Error(
        `Invalid detection bounding box geometry: { x: ${x}, y: ${y}, width: ${width}, height: ${height} }. Coordinates must be within [0, 100]%.`
      );
    }
  }

  return true;
}

/**
 * Normalizes an event object ensuring default schema fields and schema version.
 */
export function formatEventDocument(event) {
  const now = new Date().toISOString();
  return {
    schemaVersion: EVENT_SCHEMA_VERSION,
    imagePath: event.imagePath,
    originalName: event.originalName,
    location: event.location?.trim() || 'Unspecified camera trap',
    timestamp: new Date(event.timestamp || now).toISOString(),
    cameraType: event.cameraType || 'standard',
    preprocessing: event.preprocessing || {
      method: 'CLAHE',
      mode: 'standard',
      clipLimit: 2.0,
      tileGridSize: [8, 8],
      contrastScore: 0.5
    },
    detections: event.detections || [],
    animalIdentity: event.animalIdentity || null,
    identityStatus: event.identityStatus || (event.animalIdentity ? 'known' : 'not_applicable'),
    threatLevel: event.threatLevel || 'low',
    reviewStatus: event.reviewStatus || 'pending',
    inferenceMetadata: event.inferenceMetadata || {
      modelVersion: 'yolov8n',
      confidenceThreshold: 0.25,
      processingTimeMs: 0
    },
    rawInference: event.rawInference || null,
    notes: Array.isArray(event.notes) ? event.notes : [],
    createdAt: event.createdAt || now,
    updatedAt: now
  };
}
