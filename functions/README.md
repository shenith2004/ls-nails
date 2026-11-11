# Gallery database

Add and remove gallery photos from a web page instead of editing `gallery.html`.

This guide lives in `functions/` on purpose. Cloudflare Pages runs this folder as code and never publishes its files, while everything else in the repo is served publicly.

## How it works

- `gallery.html` still contains its original photos. They are unchanged and stay in the HTML for SEO.
- Photos added later are stored in a **Cloudflare D1** database. A short script in `gallery.html` fetches them from `/api/gallery` and puts them at the **top of their style's grid, newest first**, using the same markup. The counts, filters and lightbox all include them.
- If the database isn't connected or the API fails, the gallery simply shows its built-in photos and nothing breaks.
- **`/admin/`** is a password-protected page for uploading and deleting photos, and it works on a phone. Photos are resized in the browser to at most 1080 × 1920 and saved as WebP (or JPEG on browsers without WebP support). Re-encoding also strips camera metadata such as GPS location.

## One-time setup (Cloudflare dashboard)

Dashboard labels change over time, so look for the closest match.

1. **Create the database:** *Storage & databases → D1 → Create database*, named `ls-nails-gallery`. If you're asked for a location, *Asia-Pacific* is closest to Sri Lanka. You don't need to create any tables; the first upload creates them.
2. **Connect it to the site:** *Workers & Pages → this Pages project → Settings → Bindings → Add → D1 database*. Set the variable name to **`DB`**, choose `ls-nails-gallery`, and save.
3. **Set the admin password:** *Settings → Variables and secrets → Add*. Set the type to **Secret**, the name to **`ADMIN_PASSWORD`**, and the value to a long password of **at least 12 characters** (a generated one is best). Save.
4. **Redeploy:** *Deployments → latest production deployment → ⋯ → Retry deployment*. Bindings and secrets only reach new deployments.
5. Open `https://lsnails.lk/admin/` and sign in.

Steps 2 and 3 apply to **Production**. For preview deployments (branches other than `main`), repeat them with the **Preview** environment selected.

## Files

| Path | Purpose |
| --- | --- |
| `functions/_lib/gallery.js` | Shared database code (not a route) |
| `functions/api/gallery/index.js` | `GET /api/gallery`: public list of added photos |
| `functions/api/gallery/image/[id].js` | `GET /api/gallery/image/:id`: the photo itself, cached for a year |
| `functions/api/admin/_middleware.js` | Password check for everything under `/api/admin/` |
| `functions/api/admin/images/index.js` | `GET` the list, `POST` an upload |
| `functions/api/admin/images/[id].js` | `DELETE` a photo |
| `admin/index.html` | The admin page (`robots.txt` already blocks `/admin/`) |

## The database

There is one table, `gallery_images`, with these columns: `id`, `category` (classic / graphic / maximalist), `alt`, `width`, `height`, `mime`, `data` (the image, base64-encoded) and `created_at` (milliseconds).

The image is stored as base64 text because reading it back that way stays well inside the free plan's 10 ms CPU limit per request. D1 allows up to 2 MB per row, so uploads are capped at 1 MB; after resizing, photos are typically 50–200 KB.

**Backups:** D1 keeps a point-in-time history (Time Travel). For a full copy:

```sh
npx wrangler d1 export ls-nails-gallery --remote --output gallery-backup.sql
```

## Free plan

Cloudflare's free plan currently includes 100,000 function requests a day. The static pages and the built-in photos don't count; each gallery view uses one request, plus one per added photo that loads. D1 includes millions of row reads a day and up to 500 MB per database, which is enough for thousands of photos. Check Cloudflare's pricing page for current limits.

## Security

- Every `/api/admin/*` request needs `Authorization: Bearer <password>`; a wrong password gets a 401. While `ADMIN_PASSWORD` is missing or shorter than 12 characters, the admin is switched off.
- The server checks each upload's bytes, not its file name. Only JPEG, PNG and WebP are accepted, so SVG and anything else is rejected, and photos are served with `X-Content-Type-Options: nosniff`.
- Descriptions are inserted as plain text, never as HTML.
- For an optional extra lock, put `/admin/*` and `/api/admin/*` behind **Cloudflare Access** (Zero Trust) so only your email address can reach them.

## Testing locally

```sh
npx wrangler pages dev . --d1 DB --binding ADMIN_PASSWORD=a-local-test-password
```

Then open `http://localhost:8788/admin/`. Local data is kept in `.wrangler/`. If you keep local secrets in `.dev.vars`, that file is git-ignored; never commit it, because anything committed here is published on the site.

## Good to know

- Added photos appear through JavaScript, so they aren't in `sitemap.xml`. Google still sees them when it renders the page.
- To change a description or style, delete the photo and upload it again.
- After a delete, a Cloudflare data centre may keep a cached copy for a while. Only someone with the exact random URL can reach it; the gallery stops showing the photo immediately.
