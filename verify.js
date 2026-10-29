// verify.js — static site verification: links, assets, JSON-LD, SEO tags
const fs = require('fs');
const path = require('path');

const root = __dirname;
const pages = [];
(function walk(dir, base) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const rel = path.posix.join(base, f);
    if (fs.statSync(p).isDirectory()) walk(p, rel);
    else if (f.endsWith('.html')) pages.push({ abs: p, rel });
  }
})(root, '');

let errors = [], warnings = [], okCount = 0;

function fileExists(ref, fromRel) {
  const fromDir = path.dirname(path.join(root, fromRel));
  return fs.existsSync(path.resolve(fromDir, decodeURIComponent(ref.split('#')[0].split('?')[0])));
}

for (const { abs, rel } of pages) {
  const html = fs.readFileSync(abs, 'utf8');

  // --- SEO tags (404 is intentionally noindex: skip desc/canonical requirements) ---
  const is404 = path.basename(rel) === '404.html';
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1];
  const canon = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1];
  if (!title) errors.push(`${rel}: missing <title>`);
  if (!desc && !is404) errors.push(`${rel}: missing meta description`);
  if (!canon && !is404) errors.push(`${rel}: missing canonical`);
  if (is404 && !/name="robots" content="noindex"/.test(html)) errors.push(`${rel}: 404 must be noindex`);
  if (desc && desc.length > 175) warnings.push(`${rel}: description ${desc.length} chars (long)`);
  console.log(`\n== ${rel}`);
  console.log(`   title: ${title ? title.slice(0, 70) : 'MISSING'} (${title ? title.length : 0} ch)`);
  console.log(`   desc:  ${desc ? desc.length + ' ch' : 'MISSING'}  canonical: ${canon || 'MISSING'}`);

  // --- links & images ---
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m => m[1])
    .filter(r => !r.startsWith('http') && !r.startsWith('mailto:') && !r.startsWith('tel:') && !r.startsWith('#') && !r.startsWith('data:'));
  for (const r of refs) {
    const clean = r.split('#')[0].split('?')[0];
    if (clean === '' || clean.endsWith('.html') || clean.startsWith('assets/') || clean.startsWith('../assets/') || clean.endsWith('.css') || clean.endsWith('.js')) {
      if (fileExists(clean, rel)) { okCount++; }
      else errors.push(`${rel}: BROKEN ref -> ${r}`);
    } else {
      warnings.push(`${rel}: unchecked ref -> ${r}`);
    }
  }

  // --- JSON-LD ---
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
  lds.forEach((ld, i) => {
    try {
      const obj = JSON.parse(ld);
      const t = Array.isArray(obj) ? obj.map(o => o['@type']).join(',') : obj['@type'];
      console.log(`   JSON-LD #${i + 1}: OK (${t})`);
      okCount++;
    } catch (e) {
      errors.push(`${rel}: INVALID JSON-LD #${i + 1}: ${e.message}`);
    }
  });

  // --- duplicate IDs across page (navtoggle is fine, unique per page) ---
  // --- images have alt ---
  const imgs = [...html.matchAll(/<img ([^>]*)>/g)].map(m => m[1]);
  const noAlt = imgs.filter(a => !/\balt=/.test(a)).length;
  if (noAlt) errors.push(`${rel}: ${noAlt} <img> without alt`);

  // --- forms ---
  if (/<form/.test(html)) {
    const action = (html.match(/action="([^"]+)"/) || [])[1];
    if (!action || !action.includes('formsubmit.co')) errors.push(`${rel}: form action wrong: ${action}`);
    else { console.log(`   form -> ${action}`); okCount++; }
  }
}

// --- sitemap cross-check ---
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
for (const loc of locs) {
  const p = loc.replace('https://tapsys.net/', '').replace(/\/$/, loc.endsWith('blog/') ? '/index.html' : '');
  if (!fs.existsSync(path.join(root, p === '' ? 'index.html' : p))) errors.push(`sitemap: loc has no file -> ${loc} (checked ${p})`);
  else okCount++;
}
console.log(`\nsitemap entries: ${locs.length} (all map to files unless errored above)`);

console.log(`\n================ RESULT ================`);
console.log(`pages: ${pages.length} | checks passed: ${okCount}`);
console.log(`ERRORS (${errors.length}):`);
errors.forEach(e => console.log('  ✗ ' + e));
console.log(`WARNINGS (${warnings.length}):`);
warnings.forEach(w => console.log('  ~ ' + w));
if (errors.length === 0) console.log('\nALL CHECKS PASSED');
