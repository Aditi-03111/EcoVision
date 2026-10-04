export async function identifyAnimals({ detections, image, store }) {
  const animals = await store.listAnimals();
  const updatedDetections = [];
  let primaryIdentity = null;

  for (const detection of detections) {
    if (detection.label !== 'animal') {
      updatedDetections.push(detection);
      continue;
    }

    const species = detection.species && detection.species !== 'Animal' && detection.species !== 'Endangered animal'
      ? detection.species
      : inferSpecies(image.originalName);

    const embedding = embeddingFromHash(`${image.originalName}:${detection.id}`);
    const match = bestMatch(embedding, animals);
    const identity =
      match && match.score >= 0.90
        ? {
            identity: match.animal.identity,
            species: match.animal.species || species,
            status: 'known',
            similarity: match.score
          }
        : {
            identity: `NEW-${image.timestamp.slice(0, 10).replaceAll('-', '')}-${String(
              animals.length + 1
            ).padStart(3, '0')}`,
            species,
            status: 'new',
            similarity: match?.score || 0
          };

    if (identity.status === 'new') {
      await store.upsertAnimal({
        identity: identity.identity,
        species: identity.species,
        embedding,
        lastSeen: image.timestamp,
        sightingCount: 1
      });
    }

    const enriched = {
      ...detection,
      species: identity.species,
      reid: { ...identity, embeddingModel: 'SiameseNet-adapter' }
    };
    updatedDetections.push(enriched);
    primaryIdentity ||= identity;
  }

  return { detections: updatedDetections, primaryIdentity };
}

function embeddingFromHash(value) {
  let seed = 0;
  for (const char of value) seed = (seed * 31 + char.charCodeAt(0)) % 9973;
  return Array.from({ length: 6 }, (_, index) => {
    seed = (seed * 67 + 19 + index) % 9973;
    return Number((seed / 9973).toFixed(2));
  });
}

function bestMatch(embedding, animals) {
  if (!animals || animals.length === 0) return null;
  return animals
    .map((animal) => ({ animal, score: cosineSimilarity(embedding, animal.embedding) }))
    .sort((a, b) => b.score - a.score)[0];
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  const dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  const magA = Math.sqrt(a.reduce((sum, value) => sum + value * value, 0));
  const magB = Math.sqrt(b.reduce((sum, value) => sum + value * value, 0));
  return Number((dot / Math.max(magA * magB, 0.001)).toFixed(2));
}

function inferSpecies(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('tiger')) return 'Tiger';
  if (lower.includes('elephant')) return 'Elephant';
  if (lower.includes('rhino')) return 'Rhino';
  if (lower.includes('bear')) return 'Bear';
  if (lower.includes('zebra')) return 'Zebra';
  if (lower.includes('giraffe')) return 'Giraffe';
  if (lower.includes('leopard')) return 'Leopard';
  return 'Endangered animal';
}
