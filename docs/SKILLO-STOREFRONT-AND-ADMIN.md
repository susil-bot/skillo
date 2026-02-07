# Skillo: Storefront Pages, Admin Features & Multi-Tenancy

This guide explains how to add **storefront pages**, **admin-only features**, and **multi-tenancy** in your codebase, keeping all custom logic in the Skillo repo.

---

## 1. Storefront pages (your codebase only)

The storefront is a **Next.js App Router** app in `apps/storefront/`.

### Where everything lives

| What | Location |
|------|----------|
| **Pages/routes** | `apps/storefront/src/app/` (e.g. `page.tsx` = homepage, `product/[slug]/page.tsx` = product page) |
| **Commerce logic** | `apps/storefront/src/lib/vendure/` (queries, mutations, API client) |
| **Shared UI** | `apps/storefront/src/components/` (layout, commerce components, ui) |
| **Auth/session** | `apps/storefront/src/lib/auth.ts`, `contexts/auth-context.tsx` |

### Adding a new storefront page

1. **Create a route**  
   Add a folder under `src/app/` and a `page.tsx` (and optional `loading.tsx`, `layout.tsx`).

   Example: “Skillo courses” page  
   - Create `apps/storefront/src/app/courses/page.tsx`.  
   - URL: `http://localhost:3001/courses`.

2. **Call Vendure from your code only**  
   Use the existing client so the **tenant token** is sent automatically:

   ```ts
   // apps/storefront/src/app/courses/page.tsx
   import { query } from '@/lib/vendure/api';
   import { graphql } from '@/graphql';
   // Use your GraphQL doc and query() – tenant token comes from env (see below).
   ```

   All Vendure calls go through `apps/storefront/src/lib/vendure/api.ts`, which already sends:
   - **Tenant token** (`VENDURE_TENANT_TOKEN` from env – multi-tenant scope; maps to Vendure's Channel)
   - Auth token when the user is logged in

3. **Skillo branding / metadata**  
   - Site name/URL: `apps/storefront/src/lib/metadata.ts` (e.g. `SITE_NAME`, `SITE_URL`).  
   - Root layout: `apps/storefront/src/app/layout.tsx` (title, description, etc.).  
   Keep all Skillo-specific copy and SEO here.

4. **New GraphQL (shop API)**  
   - Add queries/mutations in `apps/storefront/src/lib/vendure/` (e.g. `queries.ts`, `mutations.ts`).  
   - Use `graphql` from `@/graphql` (gql.tada) so types stay in sync with the server.  
   - Run the server (and dashboard) so the storefront’s GraphQL introspection can update if you change the API.

**Summary:** All new storefront behavior stays in `apps/storefront/`. You never need to change Vendure core; only your app code and, when you add new API surface, the server (see “Admin / server-only features” below).

---

## 2. Admin new features (only in your codebase)

“Admin” here means: **backend (Admin API + plugins)** and **admin UI (Vendure Dashboard)**. All of this lives under `apps/server/` so it’s only your code.

### 2.1 Server-side admin (Admin API, plugins)

- **Config**  
  `apps/server/src/vendure-config.ts`  
  - Add plugins, custom fields, API options, auth, etc.

- **Custom fields**  
  In `vendure-config.ts`, `customFields: {}` – define Skillo-specific fields on Product, Order, Customer, etc. Migrations/sync will create DB columns.

- **New GraphQL resolvers / services**  
  - Add plugins under `apps/server/src/` (e.g. `plugins/skillo-plugin.ts`).  
  - In the plugin: register custom resolvers, extend Admin API, add services.  
  - Register the plugin in `vendure-config.ts` in the `plugins` array.  
  - Only your codebase is extended; Vendure core is unchanged.

- **Admin API URL**  
  `http://localhost:3000/admin-api` (GraphQL). Used by the Vendure Dashboard and any custom admin clients.

So: **all new admin/backend behavior is implemented in `apps/server/` (config + your plugins).**

### 2.2 Admin UI (Vendure Dashboard)

- The Dashboard is served by **DashboardPlugin** (in `vendure-config.ts`) and built from the Vendure Dashboard package; its source lives in `node_modules`, not in your repo.

- **Custom admin UI (Skillo-only)** is done with **Vendure Dashboard extensions**:
  - You add extension code under `apps/server/` (e.g. next to `vite.config.mts` / dashboard config).
  - Vendure 3 docs: [Dashboard extensions](https://docs.vendure.io/docs/developer-guide/dashboard-extensions/) (custom routes, tabs, widgets).
  - Build and serve that custom UI through the same Dashboard plugin so only your codebase contains Skillo-specific admin screens.

So: **new admin UI = Dashboard extensions implemented and built in `apps/server/`.**

---

## 3. Multi-tenancy for Skillo (tenants)

In Skillo we use **Tenant** for the multi-tenant boundary. **Categorization** (e.g. product categories) uses **Collections** and **Facets** in Vendure, not Channel. Under the hood, **one Tenant = one Vendure Channel** (Vendure has no "Tenant" entity; we map tenant → Channel).

### How it works in your repo

- **Server**  
  Supports multiple tenants via Vendure Channels (products, orders, etc. are per-channel/tenant).

- **Storefront**  
  Sends a **tenant token** on every request. Set via env: `VENDURE_TENANT_TOKEN=__default_channel__` in `apps/storefront/.env.local`. The client in `api.ts` reads `VENDURE_TENANT_TOKEN` or `NEXT_PUBLIC_VENDURE_TENANT_TOKEN` (fallback: `VENDURE_CHANNEL_TOKEN`) and sends it in the `vendure-token` header.

- **Per-request tenant**  
  Pass `tenantToken` in the `options` of `query()` / `mutate()` to serve multiple tenants from one app (e.g. by subdomain):

  ```ts
  const tenantToken = getTenantTokenForRequest();
  const { data } = await query(MyDocument, variables, { tenantToken });
  ```

### One storefront, many tenants

1. **Create one Channel per tenant** in Vendure Admin (Dashboard → Channels). Note each channel’s **token** (e.g. default is `__default_channel__`).
2. **Per tenant:** run storefront with `VENDURE_TENANT_TOKEN=<token>` or set `tenantToken` per request in code.
3. **Admin:** Switch active Channel in the Dashboard to switch tenant for Admin API.

### Tenant vs categorization

| In Skillo | In Vendure |
|-----------|------------|
| **Tenant** (multi-tenancy) | Channel (1 tenant = 1 Channel) |
| **Collections, Facets** (categorization) | Collections, Facets — use for categories, not Channel |

---

## 4. Quick reference

| Goal | Where | Notes |
|------|--------|------|
| New storefront page | `apps/storefront/src/app/.../page.tsx` | Use `query`/`mutate` from `@/lib/vendure/api`; tenant token is automatic from env or options. |
| New shop API usage | `apps/storefront/src/lib/vendure/` + `@/graphql` | Add queries/mutations; keep types in sync with server. |
| Skillo branding/SEO | `apps/storefront/src/lib/metadata.ts`, `layout.tsx` | Site name, URL, defaults. |
| New admin API / logic | `apps/server/src/` plugins + `vendure-config.ts` | Custom fields, resolvers, services. |
| New admin UI | `apps/server/` Dashboard extensions | Custom routes/tabs in the Dashboard. |
| Multi-tenant storefront | Tenant token in storefront env or per-request `tenantToken` | One tenant = one Vendure Channel; token from env or `getTenantTokenForRequest()`. |
| Categorization | Collections, Facets (in Vendure) | Use Collections/Facets for categories; do not use Channel. |

All of the above stays in **your codebase** (Skillo): storefront in `apps/storefront/`, server and dashboard extensions in `apps/server/`, with multi-tenancy driven by tenant tokens and optional request-level logic in the storefront.
