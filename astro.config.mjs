// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeMermaid from 'rehype-mermaid';
import cloudflare from '@astrojs/cloudflare';

const site = 'https://pietrodc.dev';

// Shiki transformer: wrap each code block in a <figure class="codeblock"> with
// a header bar (traffic-light dots + language + line count), matching the design.
function codeHeader() {
  const dot = (cls) => ({ type: 'element', tagName: 'span', properties: { className: ['codeblock__dot', cls] }, children: [] });
  return {
    name: 'code-header',
    root(node) {
      const pre = node.children.find((c) => c.type === 'element' && c.tagName === 'pre');
      if (!pre) return;
      const code = pre.children.find((c) => c.type === 'element' && c.tagName === 'code');
      const hasLineClass = (c) => {
        const cls = c.properties?.className ?? c.properties?.class;
        const arr = Array.isArray(cls) ? cls : typeof cls === 'string' ? cls.split(/\s+/) : [];
        return arr.includes('line');
      };
      const lineCount = code ? code.children.filter((c) => c.type === 'element' && hasLineClass(c)).length : 0;
      const lang = String(this.options?.lang || pre.properties?.dataLanguage || '').toUpperCase();
      const bar = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['codeblock__bar'], 'aria-hidden': 'true' },
        children: [
          { type: 'element', tagName: 'span', properties: { className: ['codeblock__dots'] }, children: [dot('d1'), dot('d2'), dot('d3')] },
          { type: 'element', tagName: 'span', properties: { className: ['codeblock__lang'] }, children: [{ type: 'text', value: lang }] },
          { type: 'element', tagName: 'span', properties: { className: ['codeblock__lines'] }, children: [{ type: 'text', value: `${lineCount} lines` }] },
        ],
      };
      node.children = [
        { type: 'element', tagName: 'figure', properties: { className: ['codeblock'] }, children: [bar, pre] },
      ];
    },
  };
}

// Give headings slug ids and turn the "§ NN" marker on each h2 into a
// deep-linkable anchor. Written inline to avoid extra rehype dependencies.
function rehypeSectionAnchors() {
  const slugify = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const text = (node) =>
    (node.children || [])
      .map((c) => (c.type === 'text' ? c.value : c.type === 'element' ? text(c) : ''))
      .join('');
  return (tree) => {
    let n = 0;
    const seen = Object.create(null);
    const walk = (node) => {
      for (const child of node.children || []) {
        if (child.type === 'element' && /^h[234]$/.test(child.tagName)) {
          let id = slugify(text(child)) || 'section';
          if (seen[id] != null) id = `${id}-${++seen[id]}`;
          else seen[id] = 0;
          child.properties = child.properties || {};
          child.properties.id = id;
          if (child.tagName === 'h2') {
            const num = String(++n).padStart(2, '0');
            child.children.unshift({
              type: 'element',
              tagName: 'a',
              properties: { className: ['section-anchor'], href: `#${id}` },
              children: [{ type: 'text', value: `§ ${num}` }],
            });
          }
        }
        walk(child);
      }
    };
    walk(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'always',
  // All API mutations are opaque-token gated with no cookie/session auth, so the
  // origin check protects nothing here and would block the legitimate RFC 8058
  // one-click unsubscribe POST that mail providers send cross-origin.
  security: { checkOrigin: false },
  adapter: cloudflare({
    imageService: 'compile',
    platformProxy: { enabled: true },
  }),
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'it', locales: { it: 'it', en: 'en' } },
      // Transactional confirm/unsubscribe pages are noindex; keep them out.
      filter: (page) => !/\/newsletter\//.test(page),
    }),
  ],
  markdown: {
    // Exclude mermaid from Shiki so the raw ```mermaid fence survives for
    // rehype-mermaid, which renders it to static inline SVG at build (Playwright).
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    rehypePlugins: [rehypeSectionAnchors, [rehypeMermaid, { strategy: 'inline-svg', dark: false }]],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
      transformers: [codeHeader()],
    },
  },
});
