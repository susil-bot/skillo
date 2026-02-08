# Social Connector (integrated)

OAuth and insights for **Meta (Instagram)**, **LinkedIn**, and **YouTube** run on the main Vendure server (no separate process).

## Endpoints

| Path | Description |
|------|-------------|
| `GET /health` | Health check |
| `GET /auth/meta`, `/auth/meta/callback` | Meta OAuth (optional `?userId=`) |
| `GET /auth/linkedin`, `/auth/linkedin/callback` | LinkedIn OAuth |
| `GET /auth/youtube`, `/auth/youtube/callback` | YouTube OAuth |
| `GET /insights/instagram` | Instagram posts + metrics |
| `GET /insights/linkedin` | LinkedIn posts + metrics |
| `GET /insights/youtube` | YouTube channel + videos + metrics |
| `POST /publish/instagram/image`, `/publish/instagram/reel` | Publish image or reel (body: `imageUrl`/`videoUrl`, `caption`) |
| `POST /publish/linkedin` | Text post (body: `text`) |
| `POST /publish/youtube` | Upload video (body: `title`, `description`, `tags`, `privacyStatus`, etc.) |
| `GET/POST /webhooks/meta`, `/webhooks/linkedin`, `/webhooks/youtube` | Webhook receivers for automation events |

Insights and publish accept optional `?userId=xxx` (must match OAuth `userId`).

## Config

See the server root **README.md** → “Social Connector (integrated)” for env vars (`META_APP_ID`, `LINKEDIN_CLIENT_ID`, `GOOGLE_CLIENT_ID`, etc.) and `BASE_URL`.

## Token store

Tokens are stored in `social-connector/token-store.json` (gitignored). Use a DB or secret store in production.

## Layout

- `config.js` – env-based config and redirect URIs
- `store.js` – in-memory token store with optional file persistence
- `oauth/*` – 3-legged OAuth for Meta, LinkedIn, YouTube
- `services/*` – API calls for insights (Graph, LinkedIn REST, YouTube Data/Analytics)
- `publishing/*` – Meta (image/reel), LinkedIn (text/media), YouTube (upload) posting
- `routes/auth.js`, `routes/insights.js`, `routes/publish.js`, `routes/webhooks.js` – route handlers
- `webhooks/handlers.js` – parse webhook payloads and emit events
- `automation/engine.js`, `automation/actions.js` – rule engine (event → rule → action)
- `router.js` – single Express router mounted in `vendure-config.ts` via `apiOptions.middleware`

See **docs/SOCIAL-AUTOMATION-ENGINE.md** for full architecture, platform limits, and workflow JSON format.
