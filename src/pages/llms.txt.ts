// /llms.txt: a short plain-text summary for AI tools, laid out like the old site's file
// (title, one-line description, then link lists). Every fact comes from src/data/site.ts
// so it cannot drift from the pages.
import type { APIRoute } from 'astro';
import { site as firm } from '../data/site';

export const GET: APIRoute = ({ site }) => {
  const origin = site!.origin;
  const link = (label: string, path: string) => `- [${label}](${origin}${path})`;
  const offices = firm.offices.map((o) => `- ${o.name}: ${o.lines.join(', ')}`).join('\n');
  const text = `# ${firm.name}

> ${firm.tagline}

Phone: ${firm.phoneHeader}

## Offices

${offices}

Both offices are by appointment only.

## Main pages

${link('Home', '/')}
${link('Workers\' Comp Lawyer Serving Virginia', '/virginia-workers-comp-lawyer/')}
${link('Virginia Workers\' Comp FAQ', '/virginia-workers-comp-faq/')}
${link('Blog', '/blog/')}
${link('About Pathfinder Injury Law', '/about-us/')}
${link('Bryn Swartz', '/bryn-swartz/')}
${link('Mandy Truman Swartz', '/mandy-swartz/')}
${link('Results', '/results/')}
${link('Reviews', '/reviews/')}
${link('Office Location', '/location/')}
${link('Contact', '/contact/')}

## Sitemaps

${link('XML Sitemap', '/sitemap.xml')}
`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
