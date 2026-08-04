import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../../lib/posts';
import { ui } from '../../i18n/ui';

export async function GET(context: APIContext) {
  const posts = await getPosts('en');
  return rss({
    title: `${ui.en['site.title']} · ${ui.en['home.title']}`,
    description: ui.en['home.sub'],
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.pubDate,
      link: `/en/blog/${p.slug}/`,
    })),
    customData: `<language>en-US</language>`,
  });
}
