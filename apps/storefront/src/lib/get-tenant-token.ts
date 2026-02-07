/**
 * Resolve the current request to a tenant token (Vendure Channel token).
 * Use this for multi-tenant storefronts where tenant is identified by path, subdomain, or cookie.
 *
 * Usage in server components / route handlers:
 *   const tenantToken = getTenantTokenForRequest(request);
 *   const { data } = await query(MyQuery, variables, { tenantToken });
 */

import { getTokenForTenantSlug } from './tenant-config';

export type TenantSlugSource = 'path' | 'subdomain' | 'cookie' | 'env';

/**
 * Get tenant slug from the request (path, subdomain, or cookie).
 * Customize this to match your routing (e.g. /t/[slug]/... or [tenantSlug].skillo.com).
 */
function getTenantSlugFromRequest(request?: Request): string | null {
  if (!request) return null;

  const url = request.url ? new URL(request.url) : null;
  if (!url) return null;

  // Option 1: Path-based — use /t/[tenantSlug]/... to avoid clashing with app routes
  const pathMatch = url.pathname.match(/^\/t\/([^/]+)/);
  if (pathMatch) return pathMatch[1];

  // Option 2: Subdomain — e.g. acme-store.skillo.com
  const host = request.headers.get('host') ?? url.hostname ?? '';
  const subdomain = host.split('.')[0];
  if (subdomain && !['www', 'localhost', 'skillo'].includes(subdomain)) {
    return subdomain;
  }

  // Option 3: Cookie (set by your auth/tenant middleware)
  const cookieHeader = request.headers.get('cookie');
  const tenantCookie = cookieHeader?.split(';').find((c) => c.trim().startsWith('skillo-tenant='));
  if (tenantCookie) {
    return tenantCookie.split('=')[1]?.trim() ?? null;
  }

  return null;
}

/**
 * Resolve the current request to a tenant token.
 * Use in server components: pass the request (or leave undefined to use env default).
 */
export function getTenantTokenForRequest(request?: Request): string {
  const slug = getTenantSlugFromRequest(request);
  return getTokenForTenantSlug(slug);
}
