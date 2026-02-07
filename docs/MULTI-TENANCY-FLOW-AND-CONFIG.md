# Multi-tenancy: flow, who creates tenants, user access by tenant slug, and configuration

This doc describes how multi-tenancy works in Skillo, who can create tenants, how user access is scoped by tenant (and tenant slug), and where to put the configuration.

---

## 1. High-level flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STOREFRONT (e.g. one app for all tenants)                                   │
│                                                                              │
│  1. Request arrives with tenant identity                                     │
│     (e.g. URL path /t/{tenantSlug}/... or subdomain {tenantSlug}.skillo.com) │
│                                                                              │
│  2. Resolve tenant slug → tenant token (Channel token in Vendure)             │
│     Config: tenant slug → channel token map (see section 4)                  │
│                                                                              │
│  3. Every Shop API call sends:                                               │
│     Header: vendure-token = <tenant token>                                   │
│     (+ optional Authorization for logged-in customer)                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  SERVER (Vendure)                                                            │
│                                                                              │
│  4. Vendure reads vendure-token header → active Channel (tenant)              │
│  5. All Shop API data is scoped to that Channel:                             │
│     products, collections, cart, orders, search, etc.                        │
│  6. Customer auth: customers are global; session/cart/orders are per Channel │
│     So the same customer can have different carts per tenant.                │
└─────────────────────────────────────────────────────────────────────────────┘
```

So: **tenant slug** (your identifier) → **tenant token** (Vendure’s Channel token) → **all access is scoped to that tenant**.

---

## 2. Who can create a tenant, and how

In Skillo, **one tenant = one Vendure Channel**. Creating a tenant = creating a Channel.

### Who can create a tenant

- **Superadmin** (the bootstrap user from `superadminCredentials` in `vendure-config.ts`) can do everything, including creating Channels.
- **Any Administrator** whose **Role** has the **`CreateChannel`** permission can create Channels (tenants).

So: **Superadmin** or **Admin with CreateChannel permission** can create tenants.

### How to create a tenant

**Option A – Vendure Dashboard (recommended for humans)**

1. Log in as Superadmin (or an Admin with channel permissions).
2. Go to **Settings → Channels** (or the Channels section in the Dashboard).
3. **Create channel**: set code (e.g. `acme-store`), name, currency, language, etc.
4. After creation, the Dashboard shows the channel’s **token** (e.g. `__default_channel__` for the default channel, or a generated token for new ones).  
   **That token is the tenant token** for the storefront.

**Option B – Admin API (GraphQL)**

1. Call the `createChannel` mutation (as a Superadmin or Admin with `CreateChannel` permission).
2. Response (or a follow-up query) gives the new Channel’s **token**. Use that token in the storefront as the tenant token for that tenant.

**Option C – Create-tenants script (dev setup)**

From the repo root, with the server running:

```bash
npm run create-tenants -w server
```

This script logs in as superadmin, ensures zones/country exist, and creates two Channels (tenants): **susil** and **dev** (tokens `susil` and `dev`). If the default channel does not exist, the script tries logging in with `susil` or `dev` so it works after a fresh DB or when only custom channels exist. After running, the storefront tenant-config already maps `susil` and `dev`; use `/t/susil` and `/t/dev` to open each tenant storefront.

**After creation**

- Assign products, collections, shipping, payment methods, etc. to the new Channel (tenant) via Dashboard or Admin API.
- Add the tenant to your **tenant configuration** in the storefront (slug → token) so the storefront can resolve the tenant slug to this token (see section 4).

---

## 3. User access and tenant slug

### Shop (storefront) users (customers)

- **No “tenant slug” in Vendure itself**: Vendure uses **Channel token** in the request. The storefront must decide which token to send.
- **Tenant slug** is a **Skillo concept**: you choose how to express it (e.g. path `/t/acme-store`, subdomain `acme-store.skillo.com`, or cookie).
- **Flow**:
  1. Request comes in (e.g. path or subdomain contains tenant slug `acme-store`).
  2. Storefront resolves **tenant slug → tenant token** (from config or API).
  3. Storefront sends that token on every Shop API request (e.g. `vendure-token` header).
  4. Vendure scopes **all** Shop API data to that Channel: products, collections, cart, orders, search. So **user access is effectively “by tenant”** because every call is tenant-scoped.
- **Customers**: In Vendure, Customer accounts are not tied to a single Channel; the **current request’s Channel** (from the token) defines which cart and which orders the customer sees. So “user access by tenant” = “which tenant token we send.” Same customer can have different carts/orders per tenant.

### Admin users (administrators)

- Access to **Admin API** and Dashboard is controlled by **Roles** and **Permissions**.
- Roles can be **scoped to specific Channels**. So an Administrator can be limited to one or more tenants (Channels); they only see and manage data for those Channels.
- **Configuration**: In the Dashboard, **Settings → Administrators → Role** (or Roles): assign **CreateChannel** (and other permissions) and **Channel scope** (which Channels that role can access). That’s where “admin user access by tenant” is configured—on the server, in Vendure’s role/channel model.

---

## 4. Where to put configuration

### 4.1 Tenant slug → tenant token (storefront)

This mapping is needed so the storefront can send the correct tenant token for a given tenant slug (e.g. from URL or subdomain).

**Recommended place:** a small config in the storefront that maps **tenant slug → Channel token**, and a helper that resolves the current request to a slug and then to a token.

**Implemented in this repo:**

- **Config:** `apps/storefront/src/lib/tenant-config.ts`  
  - `TENANT_SLUG_TO_TOKEN`: map tenant slug → Channel token. Add an entry when you create a new Channel (tenant).  
  - `DEFAULT_TENANT_TOKEN`: fallback (from env or `__default_channel__`).  
  - `getTokenForTenantSlug(slug)`: returns token for a slug (or default).
- **Resolver:** `apps/storefront/src/lib/get-tenant-token.ts`  
  - `getTenantTokenForRequest(request?: Request): string`  
  - Reads tenant slug from:
    - **Path:** `/t/[tenantSlug]/...` (e.g. `/t/acme-store/...`),
    - **Subdomain:** e.g. `acme-store.skillo.com`,
    - **Cookie:** `skillo-tenant=<slug>` (if you set it),
    - else uses default (env or single-tenant).
  - Returns the Channel token for that slug (from tenant-config), or the default token.

**Alternative:** Store the slug → token map in a **server endpoint** or in **Vendure custom entity/table** and have the storefront fetch it (e.g. at build time or first request). For simplicity, a static config file in the storefront is enough to start; you can replace it with an API later.

### 4.2 Who can create tenants (server)

- **Vendure config:** `apps/server/src/vendure-config.ts`  
  - `authOptions.superadminCredentials`: the Superadmin who can create Channels (and everything else).
- **Channel creation and permissions:**  
  - **Dashboard:** Settings → Roles → assign **CreateChannel** (and channel scope) to the right roles.  
  - No extra “Skillo” config file needed; this is all in Vendure’s admin model (and, if you use it, in the DB via Roles/Administrators).

### 4.3 Admin user access by tenant (server)

- **Dashboard:** Settings → Administrators → each Administrator’s **Role** → Permissions + **Channel** assignment.  
- So “which admin can see which tenant” is configured in the **server** (Vendure Dashboard or Admin API), not in the storefront. Storefront only needs the **tenant slug → token** map for **shop** (customer) access.

### 4.4 Single-tenant vs multi-tenant (storefront)

- **Single-tenant (one storefront per tenant):**  
  Set **env** `VENDURE_TENANT_TOKEN=<channel token>` (or `VENDURE_TENANT_TOKEN` in `.env.local`). No slug resolution needed.
- **Multi-tenant (one storefront, many tenants):**  
  Use **tenant slug** (path/subdomain/cookie) + **tenant-config** (slug → token) + **getTenantTokenForRequest()** and pass that token into your API client (e.g. `query(..., { tenantToken })`).

---

## 5. Summary table

| What | Who / Where | How |
|------|-------------|-----|
| **Create tenant** | Superadmin or Admin with `CreateChannel` | Dashboard → Settings → Channels → Create, or Admin API `createChannel` mutation. |
| **Tenant slug → token map** | Storefront config | e.g. `apps/storefront/src/lib/tenant-config.ts` (or server API later). |
| **Resolve request → tenant token** | Storefront | e.g. `getTenantTokenForRequest()` in `apps/storefront/src/lib/get-tenant-token.ts`, using path/subdomain/cookie + tenant-config. |
| **Customer access by tenant** | Automatic once token is set | Send `tenantToken` (Channel token) on every Shop API request; Vendure scopes data by Channel. |
| **Admin access by tenant** | Server (Vendure) | Dashboard → Roles → Permissions + Channel scope for each Role. |

---

## 6. Using the tenant config and resolver

1. **Add tenants to the map**  
   When you create a new Channel in the Dashboard, copy its token and add an entry in `apps/storefront/src/lib/tenant-config.ts`:
   ```ts
   export const TENANT_SLUG_TO_TOKEN: Record<string, string> = {
     default: '__default_channel__',
     'acme-store': '<token-from-dashboard>',
   };
   ```

2. **Use in data-fetching**  
   In server components or route handlers that call the Shop API, resolve the tenant and pass the token:
   ```ts
   import { getTenantTokenForRequest } from '@/lib/get-tenant-token';
   import { query } from '@/lib/vendure/api';

   const tenantToken = getTenantTokenForRequest(request);
   const { data } = await query(MyQuery, variables, { tenantToken });
   ```

3. **Path-based tenant URLs**  
   Use the route `/t/[tenantSlug]/...` (e.g. create `app/t/[tenantSlug]/layout.tsx` and pages under it) so that `getTenantTokenForRequest(request)` can read the slug from the path. For subdomain-based tenant, the resolver already reads the first subdomain (e.g. `acme.skillo.com` → slug `acme`).

**User access is handled by tenant slug** via this configuration and resolver; Vendure then scopes all data by the Channel token you send.

---

## 7. URL structure (how the URL will be)

The storefront supports **three ways** to identify the tenant; the resolver in `get-tenant-token.ts` uses the first that matches.

| Method   | Example URL / request                     | Tenant slug   | Use case                    |
|----------|-------------------------------------------|---------------|-----------------------------|
| **Path** | `https://yoursite.com/t/susil`            | `susil`       | One domain, many tenants    |
| **Path** | `https://yoursite.com/t/dev/products/...` | `dev`         | Same; nested routes         |
| **Subdomain** | `https://susil.yoursite.com`         | `susil`       | One subdomain per tenant    |
| **Cookie** | Any URL with cookie `skillo-tenant=susil` | `susil`   | Remember tenant choice      |

**Implemented in this repo:**

- **Path:** `/t/[tenantSlug]/...` — e.g. `/t/susil`, `/t/dev`. The slug is the first segment after `/t/`.
- **Subdomain:** Host is parsed; if the first label is not `www`, `localhost`, or `skillo`, it is used as the tenant slug (e.g. `susil.localhost:3001` → `susil`).
- **Cookie:** Name `skillo-tenant`; value = tenant slug. You set this in your auth or tenant-switcher logic.

**Concrete URLs for your two tenants:**

- Default / homepage (no tenant): `http://localhost:3001/`
- Susil tenant: `http://localhost:3001/t/susil`
- Dev tenant: `http://localhost:3001/t/dev`

Nested routes (e.g. product page) use the same slug: `http://localhost:3001/t/susil/product/...`. The storefront reads the slug from the path and sends the matching Channel token (`susil` or `dev`) on every Shop API request.

---

## 8. How the database handles multi-tenancy

Vendure does **not** use a “tenant” table. Multi-tenancy is implemented with **Channels**. One Channel = one tenant in Skillo.

### In the database

- **`channel` table**  
  One row per tenant (Channel). Columns include `id`, `code`, `token` (e.g. `susil`, `dev`, `__default_channel__`), `defaultLanguageCode`, `currencyCode`, `defaultTaxZoneId`, `defaultShippingZoneId`, etc.

- **Channel-scoped data**  
  Data that belongs to a tenant is tied to a channel in one of these ways:
  - **Direct `channelId`:** e.g. `order.channelId`, so each order belongs to one channel.
  - **Join tables:** e.g. product is available in a channel via a product–channel join; same for collection, asset, shipping method, payment method, etc. So one product can be assigned to many channels (tenants).

- **Shared vs per-tenant**  
  - **Global (shared):** Customer, Administrator, Country, Zone, TaxCategory, etc. are not channel-specific; they are shared across tenants.
  - **Per-channel (tenant):** Product (assignments), Collection (assignments), Order, Cart, StockLevel (per channel), ShippingMethod (assignments), PaymentMethod (assignments), etc. So each tenant has its own catalog visibility, orders, and carts.

### At request time

- The storefront sends **`vendure-token: <channel token>`** (e.g. `susil` or `dev`) on every Shop API request.
- Vendure resolves that token to a **Channel id** and sets the “active channel” for the request.
- All reads/writes (products, search, cart, orders, etc.) are **filtered or keyed by that channel id**. The DB does not see “tenant”;
  it only sees **channel id**. So “multi-tenant” in the DB = “multi-channel.”

### Summary

| Layer        | How tenant is represented | How DB handles it |
|-------------|----------------------------|-------------------|
| **URL**     | Slug in path/subdomain/cookie (e.g. `susil`) | Not stored; only used to choose token. |
| **Storefront** | Slug → token via `tenant-config.ts`; send `vendure-token` | N/A |
| **Server (Vendure)** | Token → Channel id | All channel-scoped tables use `channel_id` or channel join tables. |
| **Database** | Channel id | `channel` table + `channelId` / channel-join tables on orders, products, etc. |
