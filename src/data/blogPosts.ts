// Blog posts live as one Markdown file each in src/blog-posts/. The file name is the
// post's web address: insurance-recorded-statement.md becomes /insurance-recorded-statement/.
// To add a post, add one file there with the same front matter as the others.

export interface BlogPost {
  slug: string;
  path: string;
  title: string; // the headline shown on the page
  metaTitle: string; // the title search engines see
  description: string;
  date: Date;
  updated: Date;
  tags: string[];
  Content: any;
  headings: { depth: number; slug: string; text: string }[];
  words: number;
}

const files = import.meta.glob('../blog-posts/*.md', { eager: true }) as Record<string, any>;

export const posts: BlogPost[] = Object.entries(files)
  .map(([file, mod]) => {
    const slug = file.split('/').pop()!.replace(/\.md$/, '');
    const fm = mod.frontmatter;
    return {
      slug,
      path: `/${slug}/`,
      title: fm.title,
      metaTitle: fm.metaTitle ?? fm.title,
      description: fm.description,
      date: new Date(fm.date),
      updated: new Date(fm.updated ?? fm.date),
      tags: fm.tags ?? [],
      Content: mod.Content,
      headings: mod.getHeadings(),
      words: Math.round(String(mod.rawContent()).split(/\s+/).length),
    } as BlogPost;
  })
  .sort((a, b) => b.date.getTime() - a.date.getTime());

export const longDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York' });

// Up to three posts on the same topics, newest first among equals.
export function relatedPosts(current: BlogPost, count = 3): BlogPost[] {
  return posts
    .filter((p) => p.slug !== current.slug)
    .map((p) => ({ p, score: p.tags.filter((t) => current.tags.includes(t)).length }))
    .sort((a, b) => b.score - a.score || b.p.date.getTime() - a.p.date.getTime())
    .slice(0, count)
    .map((x) => x.p);
}
