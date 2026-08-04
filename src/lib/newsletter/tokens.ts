/** Unguessable opaque token (confirm / unsubscribe). */
export function newToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

/** Normalize an email for storage/dedupe. Does not validate. */
export function normEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Pragmatic email shape check (matches the client-side regex). */
export function isEmail(raw: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw);
}
