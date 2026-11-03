// Bryn's quote in his handwriting, beside a blog post (Bryn, Nov 3).
//
// A post opts in with two front-matter fields:
//   pullQuote: "The quote, in Bryn's own words."
//   pullQuoteStatus: approved      (anything else, such as drafted, shows nothing)
// If the post body already has that quote as a blockquote, that blockquote becomes the handwritten
// quote in place, so it shows only once. Otherwise the quote goes in just before the second section
// heading. It is real text in a <figure><blockquote>, never an image. src/components/BrynQuote.astro
// builds the same markup for hand-built pages.

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const norm = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, '').toLowerCase().replace(/[^a-z0-9]+/g, '');

export const brynQuoteHtml = (quote: string) =>
  `<figure class="bryn-quote"><blockquote><p>“${esc(quote.trim().replace(/^[“"]|[”"]$/g, ''))}”</p></blockquote>` +
  `<figcaption><a href="/bryn-swartz/">Bryn Swartz</a></figcaption></figure>`;

// Put the figure right under a section's heading, so on wide screens the section's text flows beside
// it (floated at the very end of a section it would leave an empty gap). A section too short to wrap
// beside the quote hands it to the next section.
const plain = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const underHeading = (html: string, from: number) => {
  const all = [...html.matchAll(/<h2[\s>]/g)].map((m) => m.index!);
  let start = from;
  const next = all.find((i) => i > start);
  if (next !== undefined && plain(html.slice(start, next)).length < 700) start = next;
  const end = html.indexOf('</h2>', start);
  return end < 0 ? start : end + 5;
};

export function withBrynQuote(html: string, quote: string): string {
  const figure = brynQuoteHtml(quote);
  const want = norm(quote);
  const h2At = (upTo: number) => [...html.slice(0, upTo).matchAll(/<h2[\s>]/g)].map((m) => m.index!);
  // 1. The quote is already in the body: take it out and show it once, at the top of its own section.
  for (const m of html.matchAll(/<blockquote>[\s\S]*?<\/blockquote>/g)) {
    if (!norm(m[0]).includes(want)) continue;
    const without = html.slice(0, m.index!) + html.slice(m.index! + m[0].length);
    const sectionStart = h2At(m.index!).pop();
    if (sectionStart === undefined) return html.slice(0, m.index!) + figure + html.slice(m.index! + m[0].length);
    const at = underHeading(without, sectionStart);
    return without.slice(0, at) + '\n' + figure + without.slice(at);
  }
  // 2. Not in the body: the second section (or the first, if there is only one).
  const h2 = [...html.matchAll(/<h2[\s>]/g)].map((m) => m.index!);
  const start = h2[1] ?? h2[0];
  if (start === undefined) return html + figure;
  const at = underHeading(html, start);
  return html.slice(0, at) + '\n' + figure + html.slice(at);
}
