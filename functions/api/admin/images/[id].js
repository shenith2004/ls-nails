import { imageUrl, isImageId, json } from '../../../_lib/gallery.js';

// DELETE /api/admin/images/:id: removes a photo from the database (and so from the gallery).
export async function onRequestDelete({ request, env, params, waitUntil }) {
  const { id } = params;
  if (!isImageId(id)) return json({ error: 'Unknown photo.' }, 404);

  const { meta } = await env.DB.prepare('DELETE FROM gallery_images WHERE id = ?').bind(id).run();
  if (!meta.changes) return json({ error: 'That photo was already removed.' }, 404);

  // Drop this data centre's cached copy too. Copies elsewhere are no longer linked from the gallery.
  waitUntil(caches.default.delete(new URL(imageUrl(id), request.url).toString()));
  return json({ deleted: id });
}
