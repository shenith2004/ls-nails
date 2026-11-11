import { json, listImages } from '../../_lib/gallery.js';

// GET /api/gallery: photos added through /admin/, newest first. gallery.html adds them to its grids.
export async function onRequestGet({ env }) {
  // Not connected yet: an empty list leaves the gallery exactly as written in the HTML.
  if (!env.DB) return json({ images: [] });

  try {
    return json({ images: await listImages(env.DB) });
  } catch (err) {
    console.error('Gallery list failed', err);
    return json({ images: [], error: 'Gallery database unavailable.' }, 500);
  }
}
