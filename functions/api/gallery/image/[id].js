import { base64ToBytes, getImageData, isImageId } from '../../../_lib/gallery.js';

function notFound() {
  return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
}

// GET /api/gallery/image/:id: the photo itself.
export async function onRequestGet({ request, env, params, waitUntil }) {
  const { id } = params;
  if (!isImageId(id) || !env.DB) return notFound();

  // A photo's URL never changes (every upload gets a new id), so browsers and this
  // data centre can keep it for a year and skip the database on repeat views.
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  let row;
  try {
    row = await getImageData(env.DB, id);
  } catch (err) {
    console.error('Gallery image read failed', err);
    return new Response('Gallery database unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  if (!row) return notFound();

  const response = new Response(base64ToBytes(row.data), {
    headers: {
      'Content-Type': row.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
  waitUntil(cache.put(request, response.clone()));
  return response;
}
