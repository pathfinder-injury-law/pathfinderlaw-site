// Cuts Bryn's handwriting font down to the letters the site uses and packs it as WOFF2.
// The full .ttf from Calligraphr stays in fonts-src/ as the source; only the small .woff2 ships.
//
// Run this after changing any text set in 'Kbs Handwriting', or after replacing the font:
//   node scripts/make-handwriting-font.mjs
// It writes public/fonts/kbs-handwriting.woff2. Commit it.
// Needs hb-subset (HarfBuzz: `brew install harfbuzz`). The WOFF2 packing uses Node's built-in Brotli.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants } from 'node:zlib';

const repo = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(repo, 'fonts-src/kbs-handwriting.ttf');
const OUT = join(repo, 'public/fonts/kbs-handwriting.woff2');

// Every character the home page sets in the handwriting font ("We’ve got this.", the quote
// initials, "you are here" and the footer map labels), plus a straight apostrophe in case an
// edit types ' instead of ’.
const TEXT = 'We’ve got this. M.W. T.B. K.W. you are here Blue Ridge Richmond Eastern Shore' + "'";

// 1. Subset, without hinting (the font only shows at large sizes).
const tmp = mkdtempSync(join(tmpdir(), 'kbs-'));
const subset = join(tmp, 'subset.ttf');
const unicodes = [...new Set(TEXT)].map((c) => c.codePointAt(0).toString(16)).join(',');
execFileSync('hb-subset', [SRC, `--unicodes=${unicodes}`, '--no-hinting', `--output-file=${subset}`]);
const sfnt = readFileSync(subset);

// 2. Pack as WOFF2 (W3C WOFF2 spec), every table stored untransformed.
const KNOWN = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT', 'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB'];
const numTables = sfnt.readUInt16BE(4);
let tables = [];
for (let i = 0; i < numTables; i++) {
  const r = 12 + i * 16;
  const tag = sfnt.toString('latin1', r, r + 4);
  const off = sfnt.readUInt32BE(r + 8), len = sfnt.readUInt32BE(r + 12);
  tables.push({ tag, data: sfnt.subarray(off, off + len) });
}
// loca must come right after glyf.
tables = tables.filter((t) => t.tag !== 'loca').flatMap((t) => (t.tag === 'glyf' ? [t, tables.find((x) => x.tag === 'loca')] : [t])).filter(Boolean);

const base128 = (n) => {
  const out = [];
  do { out.unshift(n & 0x7f); n >>>= 7; } while (n);
  return out.map((b, i) => (i < out.length - 1 ? b | 0x80 : b));
};
const dir = [];
for (const { tag, data } of tables) {
  const k = KNOWN.indexOf(tag);
  // Transform version 3 is the null transform for glyf and loca; 0 is the null transform for the rest.
  const version = tag === 'glyf' || tag === 'loca' ? 3 : 0;
  dir.push(((version << 6) | (k < 0 ? 63 : k)));
  if (k < 0) dir.push(...Buffer.from(tag, 'latin1'));
  dir.push(...base128(data.length));
}
const stream = brotliCompressSync(Buffer.concat(tables.map((t) => t.data)), {
  params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_FONT },
});
const totalSfntSize = 12 + 16 * numTables + tables.reduce((s, t) => s + ((t.data.length + 3) & ~3), 0);
const body = Buffer.concat([Buffer.from(dir), stream]);
const length = (48 + body.length + 3) & ~3;
const head = Buffer.alloc(48);
head.write('wOF2', 0, 'latin1');
head.writeUInt32BE(sfnt.readUInt32BE(0), 4);
head.writeUInt32BE(length, 8);
head.writeUInt16BE(numTables, 12);
head.writeUInt32BE(totalSfntSize, 16);
head.writeUInt32BE(stream.length, 20);
head.writeUInt16BE(1, 24);
const woff2 = Buffer.alloc(length);
Buffer.concat([head, body]).copy(woff2);
writeFileSync(OUT, woff2);
console.log(`${OUT}: ${woff2.length} bytes (${TEXT.length} characters, from ${readFileSync(SRC).length} byte .ttf)`);
