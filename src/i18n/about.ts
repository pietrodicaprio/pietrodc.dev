// About-page content. Facts are from Pietro's real site + the GUADEC post,
// NOT the Claude Design mockup (which invented Milan/Lisbon etc.).
// DRAFT — Pietro to refine wording.
import type { Lang } from './ui';

interface AboutContent {
  title: string;
  tagline: string;
  chips: string[];
  body: string[];
  elsewhere: string;
}

export const aboutContent: Record<Lang, AboutContent> = {
  it: {
    title: 'Ciao, sono Pietro.',
    tagline: "verso l'infinito e oltre",
    chips: ['software', 'prodotto', 'open source', 'brescia · italia'],
    body: [
      "Sono un software engineer italiano, classe '95. Ho fatto della mia passione un lavoro: scrivere parole quasi-inglesi su una tastiera finché non succede qualcosa di magico.",
      'Da anni gravito attorno al software libero e open source: ho lavorato a Bottles e Vanilla OS. Oggi il mio progetto principale è influencer.camp, una piattaforma per pianificare, monitorare e ottimizzare le campagne con i creator.',
      'Vivo a Brescia. Qui scrivo di codice, prodotto e delle cose che imparo costruendo, quando ne vale la pena. Se vuoi scrivermi, mi trovi qui sotto.',
    ],
    elsewhere: 'Altrove',
  },
  en: {
    title: "Hi, I'm Pietro.",
    tagline: 'to the infinity and beyond',
    chips: ['software', 'product', 'open source', 'brescia · italy'],
    body: [
      "I'm an Italian software engineer, born in '95. I made my passion my job: writing random Engl-ish words on a keyboard until something magic happens.",
      "I've been around free and open source software for years — I worked on Bottles and Vanilla OS. These days my main project is influencer.camp, a platform to plan, track and optimize campaigns with creators.",
      "I'm based in Brescia, Italy. Here I write about code, product, and the things I learn while building, when it's worth it. If you want to reach out, you'll find me below.",
    ],
    elsewhere: 'Elsewhere',
  },
};
