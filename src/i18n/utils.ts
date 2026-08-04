import { ui, defaultLang, languages, type Lang, type UIKey } from './ui';

export { languages, defaultLang, type Lang };

/** Derive the active locale from a URL pathname (default locale is unprefixed). */
export function getLangFromUrl(url: URL): Lang {
  const [, seg] = url.pathname.split('/');
  if (seg in languages) return seg as Lang;
  return defaultLang;
}

/** Translator bound to a locale, falling back to the default language. */
export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Build a locale-aware path. Default locale stays at the root, `en` is
 * prefixed with `/en`. Pass paths without a leading locale segment.
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = '/' + path.replace(/^\/+/, '').replace(/\/+$/, '');
  let full = lang === defaultLang ? clean : `/${lang}${clean === '/' ? '' : clean}`;
  if (!full) full = '/';
  // trailingSlash: 'always' — every path ends with a slash
  return full === '/' ? '/' : full + '/';
}

/** Localized display label for a category tag (enum stays Italian). */
export type Tag = 'software' | 'prodotto' | 'imprenditoria' | 'community';
const TAG_LABELS: Record<Lang, Record<Tag, string>> = {
  it: { software: 'software', prodotto: 'prodotto', imprenditoria: 'imprenditoria', community: 'community' },
  en: { software: 'software', prodotto: 'product', imprenditoria: 'founders', community: 'community' },
};
export function tagLabel(tag: Tag, lang: Lang): string {
  return TAG_LABELS[lang][tag];
}

/** Swap the current path to the same page in another locale. */
export function switchLocalePath(url: URL, target: Lang): string {
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments[0] in languages) segments.shift();
  const bare = '/' + segments.join('/');
  return localizePath(bare, target);
}
