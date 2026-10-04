/**
 * Bounding Box Validation and Normalization Utility
 * All bounding boxes are standardized to normalized percentage format [0, 100]:
 * { x: number, y: number, width: number, height: number }
 */

/**
 * Normalizes any bounding box into safe, clamped percentages in range [0, 100].
 * Handles:
 * - Percentage objects: { x, y, width, height } where values are in [0, 100]
 * - Unit ratio objects: { x, y, width, height } where values are in [0, 1]
 * - Pixel coordinates: { x, y, width, height } given imageWidth, imageHeight
 * - Corner coordinates: [x1, y1, x2, y2] or { x1, y1, x2, y2, x_min, y_min, etc. }
 *
 * @param {Object|Array} rawBbox
 * @param {Object} [imageDims] - { width: number, height: number } optional
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function normalizeBbox(rawBbox, imageDims = null) {
  if (!rawBbox) {
    throw new Error('Bounding box input is null or undefined.');
  }

  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;

  if (Array.isArray(rawBbox)) {
    if (rawBbox.length !== 4) {
      throw new Error(`Array bounding box must contain exactly 4 values [x1, y1, x2, y2], got ${rawBbox.length}.`);
    }
    const [x1, y1, x2, y2] = rawBbox.map(Number);
    x = Math.min(x1, x2);
    y = Math.min(y1, y2);
    width = Math.abs(x2 - x1);
    height = Math.abs(y2 - y1);
  } else if (typeof rawBbox === 'object') {
    if ('x1' in rawBbox && 'y1' in rawBbox && 'x2' in rawBbox && 'y2' in rawBbox) {
      const x1 = Number(rawBbox.x1);
      const y1 = Number(rawBbox.y1);
      const x2 = Number(rawBbox.x2);
      const y2 = Number(rawBbox.y2);
      x = Math.min(x1, x2);
      y = Math.min(y1, y2);
      width = Math.abs(x2 - x1);
      height = Math.abs(y2 - y1);
    } else {
      x = Number(rawBbox.x ?? rawBbox.left ?? 0);
      y = Number(rawBbox.y ?? rawBbox.top ?? 0);
      width = Number(rawBbox.width ?? rawBbox.w ?? 0);
      height = Number(rawBbox.height ?? rawBbox.h ?? 0);
    }
  } else {
    throw new Error('Bounding box must be an object or 4-element array.');
  }

  if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
    throw new Error(`Bounding box values must be valid numbers: received { x: ${x}, y: ${y}, width: ${width}, height: ${height} }`);
  }

  // If pixel dimensions provided and values exceed 1.0 (or 100), convert from pixels to percentage
  if (imageDims && imageDims.width > 0 && imageDims.height > 0) {
    const isLikelyPixels = width > 1.0 || height > 1.0 || x > 1.0 || y > 1.0;
    // If coords are in pixel range (e.g. > 1 and dimensions given)
    if (isLikelyPixels && (width > 100 || height > 100 || imageDims.width > 100)) {
      x = (x / imageDims.width) * 100;
      y = (y / imageDims.height) * 100;
      width = (width / imageDims.width) * 100;
      height = (height / imageDims.height) * 100;
    }
  }

  // If values are in 0..1 ratio format (e.g., YOLO output ratio), convert to 0..100 percentage
  const maxVal = Math.max(x, y, width, height);
  if (maxVal > 0 && maxVal <= 1.0 && width <= 1.0 && height <= 1.0) {
    x *= 100;
    y *= 100;
    width *= 100;
    height *= 100;
  }

  // Clamp and ensure bounds
  const clampedX = Math.max(0, Math.min(99.0, x));
  const clampedY = Math.max(0, Math.min(99.0, y));

  // Minimum visible dimension is 0.5%
  const clampedWidth = Math.max(0.5, Math.min(100 - clampedX, Math.max(0, width)));
  const clampedHeight = Math.max(0.5, Math.min(100 - clampedY, Math.max(0, height)));

  return {
    x: Number(clampedX.toFixed(2)),
    y: Number(clampedY.toFixed(2)),
    width: Number(clampedWidth.toFixed(2)),
    height: Number(clampedHeight.toFixed(2))
  };
}

/**
 * Validates whether a bounding box is in valid normalized [0, 100]% range.
 */
export function isValidNormalizedBbox(bbox) {
  if (!bbox || typeof bbox !== 'object') return false;
  const { x, y, width, height } = bbox;
  if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
    return false;
  }
  if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) return false;
  if (x < 0 || y < 0 || width <= 0 || height <= 0) return false;
  if (x + width > 100.01 || y + height > 100.01) return false;
  return true;
}
