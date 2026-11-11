import { CATEGORIES, MAX_IMAGE_BYTES, STYLE_ALT, insertImage, json, listImages, sniffImageType } from '../../../_lib/gallery.js';

// GET /api/admin/images: the same list the gallery uses (the admin page also uses it to check the password).
export async function onRequestGet({ env }) {
  return json({ images: await listImages(env.DB) });
}

// POST /api/admin/images: multipart form with file, category, width and height.
export async function onRequestPost({ request, env }) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Send the photo as a form upload.' }, 400);
  }

  const category = String(form.get('category') || '');
  if (!CATEGORIES.includes(category)) {
    return json({ error: 'Choose a style: Classic, Graphic or Maximalist.' }, 400);
  }

  const width = Number(form.get('width'));
  const height = Number(form.get('height'));
  if (![width, height].every((n) => Number.isInteger(n) && n > 0 && n <= 10000)) {
    return json({ error: 'The photo size is missing. Choose the photo again.' }, 400);
  }

  const file = form.get('file');
  if (!file || typeof file.arrayBuffer !== 'function') {
    return json({ error: 'Choose a photo to upload.' }, 400);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return json({ error: 'That photo is too large (the limit is 1 MB after compression).' }, 413);
  }

  // Trust the file's bytes, not the type the browser claims.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffImageType(bytes);
  if (!mime) {
    return json({ error: 'Only JPEG, PNG or WebP photos can be uploaded.' }, 415);
  }

  const image = await insertImage(env.DB, { category, alt: STYLE_ALT[category], width, height, mime, bytes });
  return json({ image }, 201);
}
