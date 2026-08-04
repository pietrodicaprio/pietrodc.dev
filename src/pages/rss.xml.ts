import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { ui } from '../i18n/ui';

export async function GET(context: APIContext) {
  const posts = await getPosts('it');
  return rss({
    title: `${ui.it['site.title']} · ${ui.it['home.title']}`,
    description: ui.it['home.sub'],
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.excerpt,
      pubDate: p.data.pubDate,
      link: `/blog/${p.slug}/`,
    })),
    customData: `<language>it-IT</language>`,
  });
}
