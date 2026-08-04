import type { APIContext } from 'astro';
import { env } from '../../lib/newsletter/env';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

/**
 * One-click (RFC 8058) list-unsubscribe: providers POST with the token in the
 * query string. The human-facing landing page posts JSON. Accept both.
 */
export async function POST(ctx: APIContext) {
  let token = new URL(ctx.request.url).searchParams.get('token') ?? '';
  if (!token) {
    try {
      const body = (await ctx.request.json()) as { token?: string };
      token = String(body.token ?? '');
    } catch {
      /* one-click bodies are form-encoded, not JSON; token came from the query */
    }
  }
  if (!token) return json({ ok: false }, 400);

  // Idempotent: unknown token still returns ok so the UI never leaks state.
  await env.DB.prepare(
    `UPDATE subscribers
     SET status = 'unsubscribed', unsubscribed_at = datetime('now'), confirm_token = NULL
     WHERE unsub_token = ? AND status != 'unsubscribed'`
  )
    .bind(token)
    .run();

  return json({ ok: true });
}
