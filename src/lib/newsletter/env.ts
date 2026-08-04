import { env as cfEnv } from 'cloudflare:workers';

// Minimal shape of the D1 methods this app uses.
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface NlEnv {
  DB: D1Database;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  RESEND_REPLY_TO: string;
}

export const env = cfEnv as unknown as NlEnv;
