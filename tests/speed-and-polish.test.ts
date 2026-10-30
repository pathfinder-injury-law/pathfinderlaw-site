// Checks on the built site (dist/) for the speed and polish work: photo copies, preloads, instant
// page loads (Speculation Rules), page transitions, print styles, theme colour, manifest and the
// skip link. Run `npm run build` first; without a build these tests skip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url);
const built = existsSync(new URL('index.html', dist));
const opts = { skip: built ? false : 'dist/ not built; run npm run build first' };
const read = (path: string) => readFileSync(new URL(`.${path}`, dist), 'utf8');
const exists = (url: string) => existsSync(new URL(`.${url}`, dist));
const css = () => readdirSync(new URL('_astro/', dist)).filter((f) => f.endsWith('.css')).map((f) => read(`/_astro/${f}`)).join('\n');

test('Home hero: AVIF and WebP copies in two sizes, art direction kept, preloaded as AVIF', opts, () => {
  const html = read('/index.html');
  const pic = html.match(/<picture class="hero-pic">[\s\S]*?<\/picture>/)![0];
  assert.match(pic, /<source media="\(max-width: 47\.99rem\)" type="image\/avif" srcset="[^"]*hero-over-shoulder-phone-480\.avif 480w, [^"]*-776\.avif 776w"/);
  assert.match(pic, /<source media="\(max-width: 47\.99rem\)" type="image\/webp"/);
  assert.match(pic, /<img class="hero-photo" src="\/images\/photos\/hero-over-shoulder-desktop\.webp" srcset="[^"]*-1024\.webp 1024w/);
  assert.match(html, /<link rel="preload" as="image" type="image\/avif" imagesrcset="[^"]*desktop-1024\.avif[^"]*" imagesizes="100vw" media="\(min-width: 48rem\)"/);
  assert.match(html, /<link rel="preload" as="image" type="image\/avif" imagesrcset="[^"]*phone-480\.avif[^"]*" imagesizes="100vw" media="\(max-width: 47\.99rem\)"/);
});

test('Every photo copy named in a page exists, and originals stay the fallback', opts, () => {
  for (const page of ['/index.html', '/about-us/index.html', '/bryn-swartz/index.html', '/contact/index.html']) {
    const html = read(page);
    const sets = [...html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)].map((m) => m[1]);
    assert.ok(sets.length > 0, page);
    for (const set of sets) for (const part of set.split(',')) assert.ok(exists(part.trim().split(' ')[0]), `${page}: ${part}`);
  }
  assert.match(read('/contact/index.html'), /<img class="hero-photo" src="\/images\/photos\/tile-b\.jpg"/);
});

test('The main font is preloaded and every font loads with font-display: swap', opts, () => {
  const html = read('/index.html');
  const m = html.match(/<link rel="preload" as="font" type="font\/woff2" href="(\/_astro\/figtree-latin-wght-normal\.[^"]+\.woff2)" crossorigin/);
  assert.ok(m && exists(m[1]), 'Figtree preload points at a built file');
  assert.ok(css().includes(m![1]), 'the preloaded file is the one the stylesheet uses');
  const faces = css().match(/@font-face\s*{[^}]*}/g) ?? [];
  assert.ok(faces.length > 0);
  for (const f of faces) assert.match(f, /font-display:\s*swap/);
});

test('Speculation Rules prerender same-site links, never the form endpoint or thank-you page', opts, () => {
  const m = read('/index.html').match(/<script type="speculationrules">([\s\S]*?)<\/script>/);
  assert.ok(m);
  const rules = JSON.parse(m![1]);
  const rule = rules.prerender[0];
  assert.equal(rule.eagerness, 'moderate');
  const excluded = rule.where.and[1].not.href_matches;
  for (const p of ['/api/*', '/thank-you', '/thank-you/*']) assert.ok(excluded.includes(p), p);
});

test('Page transitions (reduced motion respected) and print styles are in the stylesheet', opts, () => {
  const all = css().replace(/\s+/g, ' ');
  assert.match(all, /@media \(prefers-reduced-motion: ?no-preference\) ?{ ?@view-transition ?{ ?navigation: ?auto/);
  const print = all.match(/@media print ?{.*?\.call-bar.*?}/);
  assert.ok(print, 'print rules hide the phone bar');
  assert.match(all, /attr\(href\)/);
});

test('Theme colour, web app manifest and skip link', opts, () => {
  const html = read('/index.html');
  assert.match(html, /<meta name="theme-color" content="#294634"/);
  assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest"/);
  const manifest = JSON.parse(read('/manifest.webmanifest'));
  assert.equal(manifest.name, 'Pathfinder Injury Law');
  assert.equal(manifest.short_name, 'Pathfinder');
  for (const icon of manifest.icons) assert.ok(exists(icon.src), icon.src);
  assert.match(html, /<a class="skip-link" href="#main">Skip to main content<\/a>/);
  assert.match(html, /<main id="main">/);
});
