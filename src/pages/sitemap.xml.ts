// /sitemap.xml: the index that points at each child sitemap.
import type { APIRoute } from 'astro';
import { sitemaps } from '../data/sitemaps';

export const GET: APIRoute = ({ site }) => {
  const origin = site!.origin;
  const body = Object.keys(sitemaps)
    .map((name) => `  <sitemap>\n    <loc>${origin}/${name}-sitemap.xml</loc>\n  </sitemap>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
