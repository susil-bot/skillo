/**
 * Tenant (multi-tenant) configuration for Skillo.
 * Maps tenant slug (e.g. from URL path or subdomain) to Vendure Channel token.
 * One tenant = one Channel in Vendure.
 *
 * For single-tenant: set VENDURE_TENANT_TOKEN in .env and don't use slug resolution.
 * For multi-tenant: add entries here (or load from env/server) and use getTenantTokenForRequest().
 */

/** Map tenant slug → Vendure Channel token. Add entries when you create new Channels (tenants). */
export const TENANT_SLUG_TO_TOKEN: Record<string, string> = {
  default: '__default_channel__',
  susil: 'susil',
  dev: 'dev',
};

/** Fallback token when slug is missing or unknown (e.g. single-tenant or default tenant). */
export const DEFAULT_TENANT_TOKEN =
  process.env.VENDURE_TENANT_TOKEN ||
  process.env.NEXT_PUBLIC_VENDURE_TENANT_TOKEN ||
  process.env.VENDURE_CHANNEL_TOKEN ||
  process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN ||
  '__default_channel__';

/**
 * Resolve tenant slug to Channel token. Returns default token if slug is missing or not in map.
 */
export function getTokenForTenantSlug(slug: string | null | undefined): string {
  if (!slug || slug === '') return DEFAULT_TENANT_TOKEN;
  return TENANT_SLUG_TO_TOKEN[slug] ?? DEFAULT_TENANT_TOKEN;
}
