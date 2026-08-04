import type { APIContext } from 'astro';
import { env } from '../../lib/newsletter/env';
import { welcomeEmail } from '../../lib/newsletter/emails';
import { sendEmail } from '../../lib/newsletter/resend';

export const prerender = false;

type Lang = 'it' | 'en';
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

interface Row {
  id: number;
  email: string;
  locale: Lang;
  unsub_token: string;
}

export async function POST(ctx: APIContext) {
  let token = '';
  try {
    const body = (await ctx.request.json()) as { token?: string };
    token = String(body.token ?? '');
  } catch {
    return json({ ok: false }, 400);
  }
  if (!token) return json({ ok: false }, 400);

  const row = await env.DB.prepare(
    `SELECT id, email, locale, unsub_token FROM subscribers
     WHERE confirm_token = ? AND status = 'pending'`
  )
    .bind(token)
    .first<Row>();

  // Unknown or already-consumed token: link expired or already confirmed.
  if (!row) return json({ ok: false, reason: 'invalid' }, 404);

  await env.DB.prepare(
    `UPDATE subscribers
     SET status = 'confirmed', confirmed_at = datetime('now'), confirm_token = NULL
     WHERE id = ?`
  )
    .bind(row.id)
    .run();

  const origin = new URL(ctx.request.url).origin;
  const lang = row.locale === 'en' ? 'en' : 'it';
  const blogUrl = `${origin}${lang === 'en' ? '/en/' : '/'}`;
  const unsubscribeUrl = `${origin}${lang === 'en' ? '/en' : ''}/newsletter/annulla/?token=${row.unsub_token}`;
  const mail = welcomeEmail(lang, blogUrl, unsubscribeUrl);

  const sent = await sendEmail({
    apiKey: env.RESEND_API_KEY,
    from: env.RESEND_FROM,
    replyTo: env.RESEND_REPLY_TO,
    to: row.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    unsubscribeUrl: `${origin}/api/unsubscribe/?token=${row.unsub_token}`,
    tags: [{ name: 'type', value: 'welcome' }],
  });
  if (!sent.ok) console.error('resend welcome send failed', sent.status, sent.body);

  // Confirmation itself succeeded even if the welcome mail hiccuped.
  return json({ ok: true });
}
