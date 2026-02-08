# Skillo Social Connector Service

OAuth and insights service for **Instagram** (via Meta), **LinkedIn**, and **YouTube**. Users connect accounts via 3-legged OAuth; the service stores tokens and fetches post lists and analytics (likes, comments, impressions, reach, etc.) for display in Skillo’s dashboard.

**Scope:** Authentication and read-only insights only (no posting).

---

## Quick start

1. **Install and configure**
   ```bash
   cd apps/social-connector
   npm install
   cp .env.example .env
   ```
   Edit `.env` and set at least one platform’s `CLIENT_ID` and `CLIENT_SECRET` (see below).

2. **Run**
   ```bash
   npm start
   ```
   Server listens on `http://localhost:4000` (or `PORT` from `.env`).

3. **Connect a platform**
   - Open in browser: `http://localhost:4000/auth/meta` (or `/auth/linkedin`, `/auth/youtube`).
   - Complete the provider’s login and consent.
   - You are redirected to the callback; tokens are stored (in-memory + optional `token-store.json`).

4. **Fetch insights**
   - `GET http://localhost:4000/insights/instagram`
   - `GET http://localhost:4000/insights/linkedin`
   - `GET http://localhost:4000/insights/youtube`  
   Use the same `?userId=xxx` as in the auth flow if you passed one.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/auth/meta` | Redirect to Meta (Facebook) login |
| GET | `/auth/meta/callback` | Meta OAuth callback (do not call manually) |
| GET | `/auth/linkedin` | Redirect to LinkedIn login |
| GET | `/auth/linkedin/callback` | LinkedIn OAuth callback |
| GET | `/auth/youtube` | Redirect to Google (YouTube) login |
| GET | `/auth/youtube/callback` | Google OAuth callback |
| GET | `/insights/instagram` | Instagram posts + likes, comments, impressions, reach |
| GET | `/insights/linkedin` | LinkedIn posts + impressions, reactions, clicks |
| GET | `/insights/youtube` | YouTube channel + videos with views, likes, comments, watch time |

Optional query for all auth and insights: `?userId=xxx` to scope tokens per user (default: `default`).

---

## Platform setup

### Meta (Facebook + Instagram)

1. [Facebook for Developers](https://developers.facebook.com) → Create App → Consumer or Business.
2. Add **Facebook Login** and **Instagram Graph API** (or Instagram Basic Display if needed).
3. Facebook Login → Settings → Valid OAuth Redirect URIs: `http://localhost:4000/auth/meta/callback`.
4. App Dashboard → Settings → Basic: copy **App ID** and **App Secret** → `.env` as `META_APP_ID`, `META_APP_SECRET`.
5. For Instagram Business/Creator: connect an Instagram account to a Facebook Page; the app will use the Page’s linked IG account.

### LinkedIn

1. [LinkedIn Developers](https://www.linkedin.com/developers) → Create app.
2. Auth tab → Authorized redirect URL: `http://localhost:4000/auth/linkedin/callback`.
3. Products: request **Share on LinkedIn** (and **Sign In with LinkedIn** if needed). Copy Client ID and Client Secret → `.env` as `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.

### YouTube (Google)

1. [Google Cloud Console](https://console.cloud.google.com) → Create project → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application).
2. Authorized redirect URIs: `http://localhost:4000/auth/youtube/callback`.
3. Enable **YouTube Data API v3** and **YouTube Analytics API**.
4. Copy Client ID and Client Secret → `.env` as `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

---

## Environment variables

See `.env.example`. Required per platform:

- **Meta:** `META_APP_ID`, `META_APP_SECRET`
- **LinkedIn:** `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
- **YouTube:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

Common:

- `BASE_URL` – base URL of this service (e.g. `http://localhost:4000`); used to build redirect URIs.
- `PORT` – server port (default `4000`).

---

## Token storage (MVP)

Tokens are stored in memory and optionally persisted to `token-store.json` in the app directory. For production, replace the store in `store.js` with a database and encrypt tokens at rest.

---

## Project layout

```
social-connector/
  config.js           # Loads .env and exposes client IDs, secrets, URLs
  store.js            # Token get/set/delete (in-memory + optional file)
  server.js           # Express app, mounts /auth and /insights
  routes/
    auth.js           # GET /auth/meta, /auth/meta/callback, same for linkedin, youtube
    insights.js       # GET /insights/instagram, /insights/linkedin, /insights/youtube
  oauth/
    meta.oauth.js     # Meta OAuth URL + code exchange + long-lived token
    linkedin.oauth.js # LinkedIn OAuth URL + code exchange
    youtube.oauth.js  # Google OAuth URL + code exchange + refresh
  services/
    meta.service.js     # Instagram media + insights (likes, comments, impressions, reach)
    linkedin.service.js # LinkedIn posts + analytics (impressions, reactions, clicks)
    youtube.service.js  # YouTube channel + videos + Analytics (views, likes, watch time)
  .env.example
  README.md
```

---

## Running from monorepo root

From the Skillo repo root:

```bash
npm install -w apps/social-connector
npm run start -w apps/social-connector
```

Or add a root script that runs `node apps/social-connector/server.js` after setting `NODE_PATH` or `cd` to the app.
