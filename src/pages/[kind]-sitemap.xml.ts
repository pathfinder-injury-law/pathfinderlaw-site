// /post-sitemap.xml, /page-sitemap.xml, /practice_areas-sitemap.xml, /attorneys-sitemap.xml and
// /arears_served-sitemap.xml: one file per content type, same names as the old site.
import type { APIRoute } from 'astro';
import { sitemaps, xmlEscape } from '../data/sitemaps';

export function getStaticPaths() {
  return Object.keys(sitemaps).map((kind) => ({ params: { kind } }));
}

export const GET: APIRoute = ({ params, site }) => {
  const origin = site!.origin;
  const body = sitemaps[params.kind!]
    .map((u) => {
      const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
      return `  <url>\n    <loc>${xmlEscape(origin + u.path)}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
