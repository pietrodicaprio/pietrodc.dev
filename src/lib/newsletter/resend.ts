/**
 * Minimal Resend client. Open/click tracking is enabled at the domain level in
 * the Resend dashboard (Domains -> Tracking), so it applies to every send here;
 * no per-request flag exists. We still pass List-Unsubscribe headers so inbox
 * providers render a native one-click unsubscribe.
 */
interface SendArgs {
  apiKey: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  /** URL for RFC 8058 one-click unsubscribe (POST). */
  unsubscribeUrl?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; status: number; body: string }> {
  const headers: Record<string, string> = {};
  if (args.unsubscribeUrl) {
    headers['List-Unsubscribe'] = `<${args.unsubscribeUrl}>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${args.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: args.from,
      to: args.to,
      reply_to: args.replyTo,
      subject: args.subject,
      html: args.html,
      text: args.text,
      headers,
      tags: args.tags,
    }),
  });

  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}
