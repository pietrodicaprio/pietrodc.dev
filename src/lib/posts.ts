import { getCollection, type CollectionEntry } from 'astro:content';
import { languages, type Lang } from '../i18n/ui';
import { localizePath } from '../i18n/utils';

export type Post = CollectionEntry<'blog'> & {
  lang: Lang;
  slug: string;
};

/** Split a collection id ("it/my-slug") into locale + slug. */
function parseId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
}

const isProd = import.meta.env.PROD;

export const TAG_ORDER = ['software', 'prodotto', 'imprenditoria', 'community'] as const;
export type Tag = (typeof TAG_ORDER)[number];

/** Tags that actually have at least one visible post, in canonical order. */
export async function getUsedTags(lang: Lang): Promise<Tag[]> {
  const posts = await getPosts(lang);
  const used = new Set(posts.map((p) => p.data.tag as Tag));
  return TAG_ORDER.filter((tag) => used.has(tag));
}

/** All non-draft posts for a locale, newest first. */
export async function getPosts(lang: Lang): Promise<Post[]> {
  const all = await getCollection('blog', ({ id, data }) => {
    return id.startsWith(`${lang}/`) && (!isProd || !data.draft);
  });
  return all
    .map((entry) => ({ ...entry, ...parseId(entry.id) }))
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** Every post across locales (for static path generation). */
export async function getAllPosts(): Promise<Post[]> {
  const all = await getCollection('blog', ({ data }) => !isProd || !data.draft);
  return all.map((entry) => ({ ...entry, ...parseId(entry.id) }));
}

/**
 * Per-locale URLs for a post: its own URL, and its counterpart in each other
 * locale matched by `translationKey`. Falls back to that locale's home when no
 * translation exists, so the language switcher never lands on a 404.
 */
export async function getPostAlternates(post: Post): Promise<Record<Lang, string>> {
  const out = {} as Record<Lang, string>;
  const key = post.data.translationKey;
  for (const lang of Object.keys(languages) as Lang[]) {
    if (lang === post.lang) {
      out[lang] = localizePath(`/blog/${post.slug}`, lang);
      continue;
    }
    const match = key ? (await getPosts(lang)).find((p) => p.data.translationKey === key) : undefined;
    out[lang] = match ? localizePath(`/blog/${match.slug}`, lang) : localizePath('/', lang);
  }
  return out;
}

/** Approximate reading time in minutes, respecting an explicit override. */
export function readingTime(post: Post): number {
  if (post.data.mins) return post.data.mins;
  const words = post.body?.trim().split(/\s+/).length ?? 0;
  return Math.max(1, Math.round(words / 200));
}

/** Locale-formatted date as "YYYY / MM / DD" to match the design meta style. */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y} / ${m} / ${d}`;
}
