// /feed/: RSS 2.0 feed of the blog posts. Three old addresses redirect here (public/_redirects).
// The file is written to feed/index.html so that the address /feed/ (with the slash) finds it;
// public/_headers tells browsers and feed readers it is really RSS.
import type { APIRoute } from 'astro';
import { posts } from '../../data/blogPosts';
import { site as firm } from '../../data/site';
import { xmlEscape } from '../../data/sitemaps';

export const GET: APIRoute = ({ site }) => {
  const origin = site!.origin;
  const items = posts
    .map(
      (p) => `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${origin}${p.path}</link>
      <guid isPermaLink="true">${origin}${p.path}</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <description>${xmlEscape(p.description)}</description>
    </item>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(firm.name)}</title>
    <link>${origin}/blog/</link>
    <description>${xmlEscape(firm.tagline)}</description>
    <language>en-us</language>
    <lastBuildDate>${posts[0].date.toUTCString()}</lastBuildDate>
    <atom:link href="${origin}/feed/" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
