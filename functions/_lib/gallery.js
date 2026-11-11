/**
 * Shared helpers for the gallery database (a Cloudflare D1 database bound to the Pages project as `DB`).
 *
 * This file is not a route: Pages only turns files that export onRequest* handlers into URLs.
 */

// The gallery's styles and the description (alt text) every photo added to each one gets.
export const STYLE_ALT = {
  classic: 'Classic nail design by LS Nails Studio, Negombo',
  graphic: 'Graphic nail art by LS Nails Studio, Negombo',
  maximalist: 'Maximalist nail art by LS Nails Studio, Negombo',
};
export const CATEGORIES = Object.keys(STYLE_ALT);

// D1 allows up to 2 MB per row. Photos are stored base64-encoded (a third larger), so the file itself must stay under 1 MiB.
export const MAX_IMAGE_BYTES = 1024 * 1024;

// The table is created on the first upload, so a new, empty database needs no manual setup.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS gallery_images (
    id         TEXT PRIMARY KEY,
    category   TEXT NOT NULL,
    alt        TEXT NOT NULL,
    width      INTEGER NOT NULL,
    height     INTEGER NOT NULL,
    mime       TEXT NOT NULL,
    data       TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS gallery_images_created_at ON gallery_images (created_at)',
];

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function isImageId(value) {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export function imageUrl(id) {
  return `/api/gallery/image/${id}`;
}

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

// Before the first upload the table doesn't exist yet; that just means no photos have been added.
function isMissingTable(err) {
  return /no such table/i.test(String(err && err.message));
}

function toImage(row) {
  return {
    id: row.id,
    category: row.category,
    alt: row.alt,
    width: row.width,
    height: row.height,
    createdAt: row.created_at,
    src: imageUrl(row.id),
  };
}

/** Every added photo, newest first (without the image data itself). */
export async function listImages(db) {
  try {
    const { results } = await db
      .prepare(
        'SELECT id, category, alt, width, height, created_at FROM gallery_images ORDER BY created_at DESC, id LIMIT 1000'
      )
      .all();
    return results.map(toImage);
  } catch (err) {
    if (isMissingTable(err)) return [];
    throw err;
  }
}

/** One photo's type and base64 data, or null if it doesn't exist. */
export async function getImageData(db, id) {
  try {
    return await db.prepare('SELECT mime, data FROM gallery_images WHERE id = ?').bind(id).first();
  } catch (err) {
    if (isMissingTable(err)) return null;
    throw err;
  }
}

/** Stores a photo (creating the table if needed) and returns it in the same shape as listImages. */
export async function insertImage(db, { category, alt, width, height, mime, bytes }) {
  const row = { id: crypto.randomUUID(), category, alt, width, height, created_at: Date.now() };
  await db.batch([
    ...SCHEMA.map((sql) => db.prepare(sql)),
    db
      .prepare(
        'INSERT INTO gallery_images (id, category, alt, width, height, mime, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .bind(row.id, category, alt, width, height, mime, bytesToBase64(bytes), row.created_at),
  ]);
  return toImage(row);
}

/** Identifies JPEG, PNG and WebP from their first bytes; anything else (including SVG) returns null. */
export function sniffImageType(bytes) {
  const head = String.fromCharCode(...bytes.subarray(0, 12));
  if (head.startsWith('\xFF\xD8\xFF')) return 'image/jpeg';
  if (head.startsWith('\x89PNG\r\n\x1A\n')) return 'image/png';
  if (head.startsWith('RIFF') && head.slice(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

function bytesToBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
