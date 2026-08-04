import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

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
