// /robots.txt. The launch version (everything open, sitemap listed) is served ONLY when the build
// says the site is live (PUBLIC_SITE_LIVE=1). Every other build, including all previews, blocks all
// crawlers. Do not put a robots.txt in public/: it would override this file in every build.
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const live = import.meta.env.PUBLIC_SITE_LIVE === '1';
  const text = live
    ? `# Launch version. Everything is open to search engines.
# /wp-admin/ is a leftover from the old WordPress site; it no longer exists
# here, but the rule is kept so crawlers do not probe it.
User-agent: *
Disallow: /wp-admin/

Sitemap: ${site!.origin}/sitemap.xml
`
    : `# Placeholder site. Keep search engines out until launch.
User-agent: *
Disallow: /
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
