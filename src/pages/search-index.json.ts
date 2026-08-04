import type { APIRoute } from 'astro';
import { getPosts, readingTime, formatDate } from '../lib/posts';
import { localizePath } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

// Prebuilt search index (one static JSON), consumed by the ⌘K modal.
// Body text is stripped of markup and truncated for lightweight local search.
async function buildFor(lang: Lang) {
  const posts = await getPosts(lang);
  return posts.map((p) => ({
    title: p.data.title,
    excerpt: p.data.excerpt,
    tag: p.data.tag,
    date: formatDate(p.data.pubDate),
    mins: readingTime(p),
    url: localizePath(`/blog/${p.slug}`, lang),
    text: (p.body ?? '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/[#>*`_[\]()!-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 600),
  }));
}

export const GET: APIRoute = async () => {
  const data = { it: await buildFor('it'), en: await buildFor('en') };
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
