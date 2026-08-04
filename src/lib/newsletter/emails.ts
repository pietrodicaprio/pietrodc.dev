/**
 * Bilingual, inline-styled email templates. Webfonts are unreliable in mail
 * clients, so we use a system stack and a table shell for layout.
 */
type Lang = 'it' | 'en';

const GRAD = 'linear-gradient(120deg,#7c4fdb 0%,#e8557f 52%,#fbba7c 100%)';
const SENDER = 'Pietro Di Caprio';
const SENDER_PLACE = 'Brescia, Italia';

function shell(opts: { heading: string; bodyHtml: string; footerHtml: string }): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf7fc;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7fc;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #f0eaf5;">
        <tr><td style="height:6px;background:${GRAD};"></td></tr>
        <tr><td style="padding:36px 34px 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:#1f1436;">${opts.heading}</td></tr>
        <tr><td style="padding:8px 34px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#3a2e52;">${opts.bodyHtml}</td></tr>
        <tr><td style="padding:20px 34px 32px;border-top:1px solid #f0eaf5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#8b7ba8;">${opts.footerHtml}</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr><td style="border-radius:999px;background:${GRAD};">
    <a href="${url}" style="display:inline-block;padding:13px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;letter-spacing:.02em;color:#ffffff;text-decoration:none;">${label}</a>
  </td></tr></table>`;
}

const T = {
  it: {
    confirmSubject: 'Conferma la tua iscrizione',
    confirmHeading: 'Manca un ultimo passo',
    confirmBody: 'Confermi di voler ricevere le mie email? Ti scrivo solo quando ho finito di pensare a qualcosa, mai più di così.',
    confirmCta: 'Conferma iscrizione',
    confirmFallback: 'Se il bottone non funziona, copia e incolla questo link:',
    confirmIgnore: 'Se non sei stato tu a iscriverti, ignora questa email: senza conferma non riceverai nulla.',
    welcomeSubject: 'Ci sei.',
    welcomeHeading: 'Iscrizione confermata',
    welcomeBody: 'Grazie. Da ora ti scrivo quando ne vale la pena: niente auto-promozione, niente digest riciclati.',
    welcomeBody2: 'Nel frattempo trovi tutto sul blog.',
    welcomeCta: 'Vai al blog',
    unsub: 'Disiscriviti',
    footerId: `${SENDER} · ${SENDER_PLACE}`,
    footerUnsub: (url: string) => `Non vuoi più ricevere queste email? <a href="${url}" style="color:#7c4fdb;">Disiscriviti</a> in un clic.`,
  },
  en: {
    confirmSubject: 'Confirm your subscription',
    confirmHeading: 'One last step',
    confirmBody: "Confirm you want to get my emails? I only write once I'm done thinking about something, never more than that.",
    confirmCta: 'Confirm subscription',
    confirmFallback: "If the button doesn't work, copy and paste this link:",
    confirmIgnore: "If you didn't subscribe, ignore this email: without confirmation you won't get anything.",
    welcomeSubject: "You're in.",
    welcomeHeading: 'Subscription confirmed',
    welcomeBody: 'Thanks. From now on I write when it is actually worth it: no self-promotion, no recycled digests.',
    welcomeBody2: 'In the meantime, everything is on the blog.',
    welcomeCta: 'Go to the blog',
    unsub: 'Unsubscribe',
    footerId: `${SENDER} · ${SENDER_PLACE}`,
    footerUnsub: (url: string) => `Don't want these emails anymore? <a href="${url}" style="color:#7c4fdb;">Unsubscribe</a> in one click.`,
  },
} satisfies Record<Lang, Record<string, unknown>>;

export function confirmEmail(lang: Lang, confirmUrl: string) {
  const t = T[lang];
  const html = shell({
    heading: t.confirmHeading,
    bodyHtml:
      `<p style="margin:0 0 4px;">${t.confirmBody}</p>` +
      button(confirmUrl, t.confirmCta) +
      `<p style="margin:0 0 6px;color:#8b7ba8;font-size:13px;">${t.confirmFallback}</p>` +
      `<p style="margin:0;word-break:break-all;"><a href="${confirmUrl}" style="color:#7c4fdb;font-size:13px;">${confirmUrl}</a></p>`,
    footerHtml: `${t.confirmIgnore}<br><br>${t.footerId}`,
  });
  const text = `${t.confirmHeading}\n\n${t.confirmBody}\n\n${t.confirmCta}: ${confirmUrl}\n\n${t.confirmIgnore}\n${t.footerId}`;
  return { subject: t.confirmSubject, html, text };
}

export function welcomeEmail(lang: Lang, blogUrl: string, unsubscribeUrl: string) {
  const t = T[lang];
  const html = shell({
    heading: t.welcomeHeading,
    bodyHtml:
      `<p style="margin:0 0 12px;">${t.welcomeBody}</p>` +
      `<p style="margin:0;">${t.welcomeBody2}</p>` +
      button(blogUrl, t.welcomeCta),
    footerHtml: `${t.footerUnsub(unsubscribeUrl)}<br><br>${t.footerId}`,
  });
  const text = `${t.welcomeHeading}\n\n${t.welcomeBody}\n${t.welcomeBody2}\n\n${t.welcomeCta}: ${blogUrl}\n\n${t.unsub}: ${unsubscribeUrl}\n${t.footerId}`;
  return { subject: t.welcomeSubject, html, text };
}
