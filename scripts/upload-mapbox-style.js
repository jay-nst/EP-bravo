#!/usr/bin/env node
/**
 * Upload (or update) the baked style in a Mapbox account.
 *
 * Generate the file first:
 *   node --env-file=.env.local scripts/gen-mapbox-style.js earthpaper-light.style.json
 *
 * Then, with a secret token that has the `styles:write` scope:
 *   MAPBOX_USER=<account> MAPBOX_SECRET=sk.... node scripts/upload-mapbox-style.js
 *
 * To update an existing style in place, add its id:
 *   MAPBOX_USER=<account> MAPBOX_SECRET=sk.... node scripts/upload-mapbox-style.js <styleId>
 *
 * The secret token is read from the environment and never written to disk or logged.
 */

const fs = require('fs');

const STYLE_FILE = process.env.STYLE_FILE || 'earthpaper-light.style.json';

async function main() {
  const user = process.env.MAPBOX_USER;
  const secret = process.env.MAPBOX_SECRET;
  const styleId = process.argv[2];

  if (!user || !secret) {
    console.error('Missing MAPBOX_USER and/or MAPBOX_SECRET.');
    console.error('  MAPBOX_USER=<account> MAPBOX_SECRET=sk.... node scripts/upload-mapbox-style.js');
    process.exit(1);
  }
  if (!secret.startsWith('sk.')) {
    console.error('MAPBOX_SECRET must be a secret token (starts with "sk.").');
    console.error('A public pk. token cannot write styles. Create one at');
    console.error('https://account.mapbox.com/access-tokens with the styles:write scope.');
    process.exit(1);
  }
  if (!fs.existsSync(STYLE_FILE)) {
    console.error(`${STYLE_FILE} not found. Generate it first:`);
    console.error('  node --env-file=.env.local scripts/gen-mapbox-style.js');
    process.exit(1);
  }

  const body = fs.readFileSync(STYLE_FILE, 'utf8');
  try {
    JSON.parse(body);
  } catch {
    console.error(`${STYLE_FILE} is not valid JSON.`);
    process.exit(1);
  }

  const base = `https://api.mapbox.com/styles/v1/${encodeURIComponent(user)}`;
  const url = styleId
    ? `${base}/${encodeURIComponent(styleId)}?access_token=${secret}`
    : `${base}?access_token=${secret}`;
  const method = styleId ? 'PATCH' : 'POST';

  console.log(`${method} ${styleId ? 'update' : 'create'} as "${user}" (${Math.round(body.length / 1024)} KB)`);

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(`Failed: HTTP ${res.status}`);
    // Redact the token if Mapbox echoes the request URL back in an error.
    console.error(text.replace(/sk\.[A-Za-z0-9._-]+/g, 'sk.<redacted>').slice(0, 600));
    if (res.status === 401) console.error('\nToken rejected. Confirm it has styles:write.');
    if (res.status === 404) console.error('\nCheck MAPBOX_USER (it is the account name, not an email).');
    if (res.status === 422) console.error('\nStyle JSON rejected. Re-run gen-mapbox-style.js.');
    // Set the code rather than exiting outright — process.exit() here aborts while
    // the fetch handle is still closing, which trips a libuv assertion on Windows.
    process.exitCode = 1;
    return;
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.log('Uploaded, but the response was not JSON:');
    console.log(text.slice(0, 300));
    return;
  }

  console.log('\nDone.');
  console.log(`  style id:  ${json.id}`);
  console.log(`  style URL: mapbox://styles/${user}/${json.id}`);
  console.log('\nUse that URL with any public pk. token:');
  console.log(`  new mapboxgl.Map({ style: 'mapbox://styles/${user}/${json.id}' })`);
  console.log('\nTo update later, pass the id back:');
  console.log(`  node scripts/upload-mapbox-style.js ${json.id}`);
}

main().catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
