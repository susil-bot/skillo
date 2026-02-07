# Renaming Vendure → Skillo: Will the app still work?

This analysis covers what you can safely rename to **Skillo** (branding / your codebase) vs what must stay **Vendure** (framework contracts).

---

## Short answer

**Yes, the app will work properly if you rename in the right places.**

- You **can** change: API paths, header names, env var names, package display names, DB name, and any **your** code/comments/docs to use “Skillo”.
- You **must keep**: npm package names `@vendure/*`, imports from `@vendure/core`, the **value** of headers/URLs in sync between server and storefront, and the config file name if you keep importing it as `vendure-config`.

If you change server paths/headers, you **must** change the storefront to use the same paths/headers; otherwise the app will break until they match again.

---

## 1. What MUST stay “Vendure” (do not rename)

These are tied to the open‑source framework. Changing them would break the app or require forking the framework.

| Item | Why it must stay |
|------|-------------------|
| **npm packages** `@vendure/core`, `@vendure/email-plugin`, etc. | They are the actual library; renaming would mean different packages. |
| **Imports** `from '@vendure/core'`, `from './vendure-config'` | Code would break if you remove the packages or rename the config file without updating every import. |
| **Type names** e.g. `VendureConfig` | Defined by the library; you can’t rename the type. |
| **Server config filename** `vendure-config.ts` | Can be renamed (e.g. to `skillo-config.ts`) only if you update **every** import that references it (`index.ts`, `index-worker.ts`, dashboard build, etc.). |

So: **library packages and types stay “Vendure”; your app code and config can use “Skillo” where it’s under your control.**

---

## 2. What you CAN change to Skillo (app will work if done consistently)

These are either **configurable in Vendure** or **only in your code**. If you change them, keep server and storefront in sync.

### 2.1 Server API paths (configurable in Vendure)

In `apps/server/src/vendure-config.ts` you have:

```ts
apiOptions: {
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
```

You **can** rename these to Skillo, for example:

- `adminApiPath: 'skillo-admin-api'`
- `shopApiPath: 'skillo-shop-api'`

Then:

- Admin API URL becomes: `http://localhost:3000/skillo-admin-api`
- Shop API URL becomes: `http://localhost:3000/skillo-shop-api`

**Storefront must use the same URLs** (e.g. in `.env`: `SKILLO_SHOP_API_URL=http://localhost:3000/skillo-shop-api`). If the storefront still points to `/shop-api`, requests will 404 and the app will not work until URLs match.

### 2.2 Header names (configurable in Vendure)

Vendure allows custom header names:

- **Channel/tenant token:** `apiOptions.channelTokenKey` (default `'vendure-token'`). You can set e.g. `'skillo-tenant-token'`.
- **Auth token:** `authOptions.authTokenHeaderKey` (default `'vendure-auth-token'`). You can set e.g. `'skillo-auth-token'`.

If you change these in the **server** config, the **storefront** must send the same header names and read the same env (e.g. `SKILLO_TENANT_TOKEN`, cookie name for auth). Otherwise auth and tenant scope break.

### 2.3 Env vars and cookie names (your code only)

In the storefront you use:

- `VENDURE_SHOP_API_URL` → can be renamed to e.g. `SKILLO_SHOP_API_URL` and read in `api.ts`.
- `VENDURE_TENANT_TOKEN` / `VENDURE_CHANNEL_TOKEN` → can be `SKILLO_TENANT_TOKEN`.
- `VENDURE_AUTH_TOKEN_COOKIE` / `vendure-auth-token` → can be `SKILLO_AUTH_TOKEN_COOKIE` and `skillo-auth-token` (and the server `authTokenHeaderKey` / cookie options must match).

As long as the **values** (URLs, header names, cookie names) match between server and storefront, the app will work. The **variable names** in your code (e.g. `SKILLO_*`) are just for your branding.

### 2.4 Database name / user (optional)

In `apps/server/.env` and `docker-compose.yml` you have:

- `DB_NAME=vendure`, `DB_USERNAME=vendure`, `POSTGRES_DB: vendure`, `POSTGRES_USER: vendure`.

You **can** change these to e.g. `skillo` for DB name and user. If you already have a running DB and data, you’d need to create a new DB (or rename) and point the app to it; otherwise the app will work with the new name.

### 2.5 Package name in package.json (display only)

- Storefront: `"name": "nextjs-starter-vendure"` in package.json can be changed to e.g. `"name": "skillo-storefront"`. This does not affect runtime; only package identity and docs.

### 2.6 Folder names and imports (your code only)

- `apps/storefront/src/lib/vendure/` (e.g. `api.ts`, `queries.ts`) **can** be renamed to e.g. `lib/skillo/` or `lib/api/`, but then **every** import like `@/lib/vendure/api` must be updated to the new path. If you do a global rename and update all imports, the app will work.

### 2.7 Comments, docs, and UI text

- Any comment, README, or UI string that says “Vendure” can be changed to “Skillo” (e.g. hero link, footer). No runtime impact.

---

## 3. Summary table

| What | Safe to rename to Skillo? | Notes |
|------|---------------------------|--------|
| npm packages `@vendure/*` | No | Library name; required for the app to run. |
| Imports `from '@vendure/core'` | No | Must match the package. |
| `VendureConfig`, other types from `@vendure/*` | No | Defined by the library. |
| `adminApiPath` / `shopApiPath` | Yes | Set e.g. `skillo-admin-api`, `skillo-shop-api`; then point storefront to same URLs. |
| `channelTokenKey` / `authTokenHeaderKey` | Yes | Set e.g. `skillo-tenant-token`, `skillo-auth-token`; storefront must use same headers/cookies. |
| Env vars (e.g. `VENDURE_*` → `SKILLO_*`) | Yes | Update server and storefront to use same values. |
| DB name / user (`vendure` → `skillo`) | Yes | Optional; handle existing DB if needed. |
| `lib/vendure/` folder name | Yes | Rename and update all imports. |
| `vendure-config.ts` filename | Yes | Only if you update every import. |
| Package name in package.json | Yes | Display only. |
| Comments, docs, UI text | Yes | No runtime impact. |

---

## 4. Recommended approach if you rename

1. **Server (`apps/server`)**  
   - In `vendure-config.ts`: set `adminApiPath`, `shopApiPath`, `channelTokenKey`, and `authTokenHeaderKey` to your Skillo names.  
   - Optionally rename DB in `.env` and docker-compose to `skillo` and (if needed) create the new DB.

2. **Storefront (`apps/storefront`)**  
   - In `.env` / `.env.local`: use the new Shop API URL (e.g. `http://localhost:3000/skillo-shop-api`) and the new header/cookie names if you changed them.  
   - In `api.ts` and `auth.ts`: read from `SKILLO_*` env vars and send the same header/cookie names the server expects.

3. **Keep in sync**  
   - Any time you change a path or header on the server, update the storefront to use that same path/header. Then the app will work properly with Skillo naming.

---

## 5. Conclusion

- The app **will work properly** if you:
  - Keep all `@vendure/*` packages and their imports/types as they are.
  - Change only **configurable** and **your** names (paths, headers, env, DB, folder names, docs) and keep **server and storefront in sync** (same URLs, same header/cookie names).

- The app **will break** if you:
  - Remove or rename the `@vendure/*` packages, or
  - Change server paths/headers without updating the storefront (or the other way around).

So: **yes, you can change the naming to Skillo in your codebase and config; the app will work as long as you don’t touch the Vendure library itself and you keep server and storefront aligned.**
