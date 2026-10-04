export const ANIMAL_SCHEMA_VERSION = '1.0.0';

/**
 * Validates an animal document.
 * Throws an Error with descriptive message if validation fails.
 */
export function validateAnimal(animal) {
  if (!animal || typeof animal !== 'object') {
    throw new Error('Animal must be a valid object.');
  }

  if (!animal.identity || typeof animal.identity !== 'string') {
    throw new Error('Animal must have a valid string identity (e.g. TGR-014).');
  }

  if (!animal.species || typeof animal.species !== 'string') {
    throw new Error('Animal must have a valid string species.');
  }

  if (animal.embedding && !Array.isArray(animal.embedding)) {
    throw new Error('Animal embedding must be an array of numeric values.');
  }

  if (animal.lastSeen) {
    const lastSeenDate = new Date(animal.lastSeen);
    if (isNaN(lastSeenDate.getTime())) {
      throw new Error('Animal lastSeen must be a valid ISO date string.');
    }
  }

  return true;
}

/**
 * Normalizes an animal document ensuring versioning and default attributes.
 */
export function formatAnimalDocument(animal) {
  const now = new Date().toISOString();
  return {
    schemaVersion: ANIMAL_SCHEMA_VERSION,
    identity: animal.identity,
    species: animal.species,
    embedding: Array.isArray(animal.embedding) ? animal.embedding : [],
    lastSeen: animal.lastSeen || now,
    sightingCount: typeof animal.sightingCount === 'number' ? animal.sightingCount : 1,
    notes: Array.isArray(animal.notes) ? animal.notes : [],
    createdAt: animal.createdAt || now,
    updatedAt: now
  };
}
