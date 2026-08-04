import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Posts live one folder per locale: src/content/blog/it/*.mdx, src/content/blog/en/*.mdx
// The entry id is `<lang>/<slug>` (e.g. "it/fatturare-zero-per-un-anno").
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      pubDate: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tag: z.enum(['software', 'prodotto', 'imprenditoria', 'community']),
      // Optional reading-time override; otherwise computed from body length.
      mins: z.number().int().positive().optional(),
      // Optional cover for social cards; illustrations are auto-picked by tag.
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
      // Links a translation to its counterpart in the other locale (shared slug key).
      translationKey: z.string().optional(),
    }),
});

export const collections = { blog };
