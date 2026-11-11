import { json } from '../../_lib/gallery.js';

const MIN_PASSWORD_LENGTH = 12;

// Compares SHA-256 digests byte by byte, so response time doesn't reveal how much of a guess was right.
async function passwordMatches(supplied, expected) {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all(
    [supplied, expected].map((value) => crypto.subtle.digest('SHA-256', encoder.encode(value)))
  );
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function suppliedPassword(request) {
  const header = request.headers.get('Authorization') || '';
  if (!header.startsWith('Bearer ')) return '';
  // The admin page URI-encodes the password so any character survives an HTTP header.
  try {
    return decodeURIComponent(header.slice(7)).trim();
  } catch {
    return '';
  }
}

// Guards every /api/admin/* request.
export async function onRequest({ request, env, next }) {
  const expected = typeof env.ADMIN_PASSWORD === 'string' ? env.ADMIN_PASSWORD.trim() : '';
  if (expected.length < MIN_PASSWORD_LENGTH) {
    return json(
      {
        error: `Admin is switched off. Add a secret named ADMIN_PASSWORD (at least ${MIN_PASSWORD_LENGTH} characters) to the Cloudflare Pages project, then redeploy.`,
      },
      503
    );
  }

  const supplied = suppliedPassword(request);
  if (!supplied || !(await passwordMatches(supplied, expected))) {
    return json({ error: 'Wrong password.' }, 401);
  }

  if (!env.DB) {
    return json(
      {
        error: 'Database not connected. Add a D1 database binding named DB to the Cloudflare Pages project, then redeploy.',
      },
      503
    );
  }

  try {
    return await next();
  } catch (err) {
    console.error('Gallery admin request failed', err);
    return json({ error: 'Something went wrong on the server. Please try again.' }, 500);
  }
}
