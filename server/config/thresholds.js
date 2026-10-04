/**
 * Configurable detection thresholds by species and camera type.
 */

export const DEFAULT_THRESHOLDS = {
  global: 0.25,
  cameraTypes: {
    daylight: 0.30,
    infrared: 0.20,
    thermal: 0.22,
    covert: 0.18,
    standard: 0.25
  },
  species: {
    // Classes detected by YOLO COCO and domain mappings
    human: 0.25,
    person: 0.25,
    vehicle: 0.30,
    car: 0.30,
    truck: 0.30,
    motorcycle: 0.30,
    bus: 0.30,
    animal: 0.25,
    bird: 0.35,
    cat: 0.30,
    dog: 0.30,
    horse: 0.30,
    sheep: 0.30,
    cow: 0.30,
    elephant: 0.30,
    bear: 0.30,
    zebra: 0.30,
    giraffe: 0.30,
    tiger: 0.35,
    rhino: 0.30,
    leopard: 0.35
  }
};

let activeThresholds = {
  ...DEFAULT_THRESHOLDS,
  cameraTypes: { ...DEFAULT_THRESHOLDS.cameraTypes },
  species: { ...DEFAULT_THRESHOLDS.species }
};

export function getDetectionThreshold({ cameraType = null, species = null, label = null, override = null } = {}) {
  if (typeof override === 'number' && !isNaN(override) && override >= 0.05 && override <= 0.95) {
    return Number(override.toFixed(2));
  }

  // Check species or label threshold
  const key = (species || label || '').toLowerCase().trim();
  if (key && activeThresholds.species[key] !== undefined) {
    return activeThresholds.species[key];
  }

  // Check camera type threshold if explicitly provided
  const camKey = (cameraType || '').toLowerCase().trim();
  if (camKey && activeThresholds.cameraTypes[camKey] !== undefined) {
    return activeThresholds.cameraTypes[camKey];
  }

  return activeThresholds.global;
}

export function getAllThresholds() {
  return JSON.parse(JSON.stringify(activeThresholds));
}

export function updateThresholds(updates) {
  if (!updates || typeof updates !== 'object') {
    throw new Error('Threshold updates must be an object.');
  }

  if (typeof updates.global === 'number') {
    if (updates.global < 0.05 || updates.global > 0.95) {
      throw new Error('Global threshold must be between 0.05 and 0.95.');
    }
    activeThresholds.global = Number(updates.global.toFixed(2));
  }

  if (updates.cameraTypes && typeof updates.cameraTypes === 'object') {
    for (const [cam, val] of Object.entries(updates.cameraTypes)) {
      if (typeof val === 'number' && val >= 0.05 && val <= 0.95) {
        activeThresholds.cameraTypes[cam.toLowerCase()] = Number(val.toFixed(2));
      }
    }
  }

  if (updates.species && typeof updates.species === 'object') {
    for (const [sp, val] of Object.entries(updates.species)) {
      if (typeof val === 'number' && val >= 0.05 && val <= 0.95) {
        activeThresholds.species[sp.toLowerCase()] = Number(val.toFixed(2));
      }
    }
  }

  return getAllThresholds();
}

export function resetThresholds() {
  activeThresholds = {
    ...DEFAULT_THRESHOLDS,
    cameraTypes: { ...DEFAULT_THRESHOLDS.cameraTypes },
    species: { ...DEFAULT_THRESHOLDS.species }
  };
  return getAllThresholds();
}
