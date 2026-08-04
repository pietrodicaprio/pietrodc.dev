import type { APIContext } from 'astro';
import { env } from '../../lib/newsletter/env';
import { newToken, normEmail, isEmail } from '../../lib/newsletter/tokens';
import { confirmEmail } from '../../lib/newsletter/emails';
import { sendEmail } from '../../lib/newsletter/resend';

export const prerender = false;

type Lang = 'it' | 'en';
const asLang = (v: unknown): Lang => (v === 'en' ? 'en' : 'it');

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

interface Row {
  status: 'pending' | 'confirmed' | 'unsubscribed';
  // Seconds since the last confirm email was sent, or null if never.
  since_sec: number | null;
}

// Minimum gap between confirm emails to the same address. Caps how fast a
// scripted loop can mail a chosen victim (edge rate-limit still recommended).
const RESEND_COOLDOWN_SEC = 300;

export async function POST(ctx: APIContext) {
  let email = '';
  let lang: Lang = 'it';
  try {
    const body = (await ctx.request.json()) as { email?: string; locale?: string };
    email = String(body.email ?? '');
    lang = asLang(body.locale);
  } catch {
    return json({ ok: false }, 400);
  }

  if (!isEmail(email)) return json({ ok: false }, 422);
  const norm = normEmail(email);

  let confirmToken: string;
  try {
    const existing = await env.DB.prepare(
      `SELECT status,
              CASE WHEN confirm_sent_at IS NULL THEN NULL
                   ELSE strftime('%s','now') - strftime('%s', confirm_sent_at) END AS since_sec
       FROM subscribers WHERE email_norm = ?`
    )
      .bind(norm)
      .first<Row>();

    // Already active: nothing to do, and never resend to a confirmed address.
    if (existing?.status === 'confirmed') return json({ ok: true });

    // Cooldown: a recently-mailed pending/unsubscribed address is not re-mailed.
    // Respond ok either way so the endpoint reveals no subscription state.
    if (existing && existing.since_sec !== null && existing.since_sec < RESEND_COOLDOWN_SEC) {
      return json({ ok: true });
    }

    confirmToken = newToken();
    if (!existing) {
      await env.DB.prepare(
        `INSERT INTO subscribers (email, email_norm, locale, status, confirm_token, unsub_token, confirm_sent_at)
         VALUES (?, ?, ?, 'pending', ?, ?, datetime('now'))`
      )
        .bind(email.trim(), norm, lang, confirmToken, newToken())
        .run();
    } else {
      // pending or previously unsubscribed: reset to pending with a fresh token.
      await env.DB.prepare(
        `UPDATE subscribers
         SET status = 'pending', confirm_token = ?, locale = ?, unsubscribed_at = NULL,
             confirm_sent_at = datetime('now')
         WHERE email_norm = ?`
      )
        .bind(confirmToken, lang, norm)
        .run();
    }
  } catch (err) {
    // Includes the UNIQUE(email_norm) race between two concurrent new signups.
    console.error('subscribe db error', err);
    return json({ ok: false }, 500);
  }

  const origin = new URL(ctx.request.url).origin;
  const confirmUrl = `${origin}${lang === 'en' ? '/en' : ''}/newsletter/conferma/?token=${confirmToken}`;
  const mail = confirmEmail(lang, confirmUrl);

  const sent = await sendEmail({
    apiKey: env.RESEND_API_KEY,
    from: env.RESEND_FROM,
    replyTo: env.RESEND_REPLY_TO,
    to: email.trim(),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    tags: [{ name: 'type', value: 'confirm' }],
  });

  if (!sent.ok) {
    console.error('resend confirm send failed', sent.status, sent.body);
    return json({ ok: false }, 502);
  }
  return json({ ok: true });
}
