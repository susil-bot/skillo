# Social Automation Engine — Architecture & R&D

Skillo evolves the **Social Connector** (OAuth + insights) into a **Social Automation Engine** with:

1. **Post publishing** to Instagram/Facebook, LinkedIn, YouTube  
2. **Webhooks** for real-time events (comments, mentions, uploads)  
3. **Automation rules** (Trigger → Condition → Action)

This document covers architecture, API capabilities, limitations, and implementation notes.

---

## High-level architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SKILLO BACKEND (Vendure)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Social Connector (existing)     │  Social Automation (new)                │
│  ├── OAuth (Meta, LinkedIn, YT)   │  ├── Publishing services                │
│  ├── Token store                  │  │   └── Meta / LinkedIn / YouTube       │
│  └── Insights (read-only)         │  ├── Webhook handlers                   │
│                                   │  │   └── /webhooks/meta|linkedin|youtube │
│                                   │  └── Automation engine                  │
│                                   │      ├── Event bus (in-memory or queue) │
│                                   │      ├── Rule engine                    │
│                                   │      └── Action runners                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Workflow Builder (Dashboard)                                                │
│  React Flow: TriggerNode → ConditionNode → ActionNode, DelayNode             │
│  Export: { nodes, edges } JSON → consumed by backend rule engine             │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Connectors**: platform-specific OAuth, tokens, and API clients (existing + publishing).  
- **Webhook handlers**: verify platform signatures, parse payloads, emit internal events.  
- **Automation engine**: listens for events, evaluates rules, runs actions (fetch insights, notify, create post, flag).

---

# Part 1 — Post publishing

## 1.1 Meta (Instagram / Facebook) — Graph API

### Capabilities

| Content type   | Supported | Endpoint / flow |
|---------------|-----------|------------------|
| Single image  | Yes       | `POST /{ig-user-id}/media` (image_url) → `POST /{ig-user-id}/media_publish` |
| Carousel      | Yes       | Create container with `children` (media IDs) → publish |
| Reel (video)  | Yes       | `POST /{ig-user-id}/media` (media_type=REELS, video_url) — must be publicly accessible |
| Schedule      | Via API   | `published=false` + `timestamp` for container (scheduling not always available; check product) |

### Required permissions / scopes

- **Instagram API (Facebook Login)**: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`; sometimes `ads_management` or `ads_read` for Business Manager.  
- **Instagram API (Instagram Login)**: `instagram_business_basic`, `instagram_business_content_publish`.

### Media upload

- Image/reel **URL must be publicly accessible** when Instagram fetches it.  
- Resumable video uploads (Facebook Login): use `rupload.facebook.com`.  
- No direct binary upload to Instagram; use URL or Facebook resumable.

### Rate limits

- General Graph API rate limits apply; no single documented “posts per day” for content publishing — throttle and respect 429 responses.

### What is NOT allowed

- Publishing from a **personal** (non-professional) Instagram account via API.  
- Alt text on reels/stories (only on image posts as of doc date).  
- Some scheduling flows depend on product; verify in current Meta docs.

---

## 1.2 LinkedIn — Posts API / UGC Post API

### Capabilities

| Content type | Supported | Notes |
|-------------|----------|--------|
| Text only   | Yes      | Simple post |
| Image       | Yes      | Register asset → attach to post |
| Video       | Yes      | Upload via upload URL, then attach |
| Multi-image | Yes      | Posts API multi-image |
| Document    | Yes      | Supported in Posts API |
| Polls        | Yes      | Posts API |

### Required permissions

- **Scopes**: `w_member_social` (personal), `w_organization_social` (organization page).  
- **Headers**: `LinkedIn-Version: YYYYMM`, `X-Restli-Protocol-Version: 2.0.0`.

### Media upload flow

1. **Image**: Register upload (e.g. `POST /rest/images?action=uploadUrl`) → get asset URN → use in post `specificContent`.  
2. **Video**: Request upload URL → PUT binary to URL → poll until ready → use asset URN in post.  
3. **Post**: POST to versioned Posts API with `author`, `lifecycleState: PUBLISHED`, `specificContent`, `visibility` (e.g. PUBLIC, CONNECTIONS).

### Rate limits

- Throttling by application; exact limits in LinkedIn developer docs. Use exponential backoff on 429.

### What is NOT allowed

- Relying on deprecated `ugcPosts` long-term; migrate to versioned Posts API.  
- Certain content policies (promotions, prohibited content); enforce via validation before publish.

---

## 1.3 YouTube — Data API v3

### Capabilities

| Feature        | Supported | Endpoint / flow |
|----------------|-----------|------------------|
| Upload video   | Yes       | `POST https://www.googleapis.com/upload/youtube/v3/videos` (resumable or simple) |
| Title, description, tags | Yes | `snippet` in request body |
| Privacy        | Yes       | `status.privacyStatus` (public, unlisted, private) |
| Schedule       | Via       | `status.publishAt` (ISO 8601) |

### Required permissions

- **Scopes**: `https://www.googleapis.com/auth/youtube.upload` or `youtube.force-ssl`.

### Media upload

- **Resumable upload**: Initiate with `uploadType=resumable`, get session URI, PUT chunks.  
- **Simple upload**: Single POST with body (small files).  
- Max file size 256 GB; quota cost ~100 units per insert.

### Rate limits

- Quota per project; 10,000 units/day default — each `videos.insert` consumes units. Use resumable for large files to avoid duplicate charges on retry.

### What is NOT allowed

- Unverified projects (created after July 2020): uploads are **private only** until compliance verification.  
- No server-side “go live” for live streams via this API only (separate Live Streaming API).

---

# Part 2 — Webhooks (real-time events)

## 2.1 Meta (Instagram / Facebook)

### Supported subscriptions

- **comments**: New comment on media (feed, story, ad, reel).  
- **mentions**: Business/Creator account @mentioned in caption or comment.  
- **messages**: Messenger/Instagram messaging (if enabled).

### Skillo endpoint design

- **Route**: `POST /webhooks/meta`  
- **Verification**: GET with `hub.mode`, `hub.verify_token`, `hub.challenge` — return `hub.challenge` to verify.  
- **Payload**: POST body with `object`, `entry`, `changes`; decode and emit internal events (e.g. `meta:comment`, `meta:mention`).

### Events we can map

- New comment → `meta:comment`  
- New like (if exposed via webhook) → `meta:like`  
- Post published confirmation → often from publishing API response; optional webhook if Meta provides it.  
- **Limitation**: Comment/mention webhooks have been reported as not firing in some setups; document and consider polling fallback for critical flows.

---

## 2.2 LinkedIn

### Supported webhooks

- **Job applications**, **organization social actions**, **job status / resync** (talent/apply products).  
- **No generic “new comment on post” or “new like”** webhook for organic feed posts in the same way as Meta.

### Skillo endpoint design

- **Route**: `POST /webhooks/linkedin`  
- **Verification**: LinkedIn sends validation request; verify with HMAC (e.g. `x-li-signature`) using client secret; return 200.  
- **Polling fallback**: For “new comment / like” on organic posts, use **polling** (periodic insights or activity API) and emit internal events from the automation engine.

### Events we can map

- New application (if using Job Postings) → `linkedin:application`.  
- Organization social actions (if available for your app) → `linkedin:social_action`.  
- New comment / like on post → **polling** → emit `linkedin:comment` / `linkedin:reaction` in our engine.

---

## 2.3 YouTube — PubSubHubbub (WebSub)

### Supported

- **Channel uploads**: New video uploaded, or video title/description updated.  
- **Topic**: `https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}`.  
- **Hub**: Google PubSubHubbub; subscribe with callback URL and topic.

### Skillo endpoint design

- **Route**: `POST /webhooks/youtube` (and GET for hub subscription confirmation if needed).  
- **Payload**: Atom feed with `<yt:videoId>`, `<yt:channelId>`; parse and emit `youtube:video_uploaded` (and optionally `youtube:video_updated`).

### Events we can map

- New video → `youtube:video_uploaded`  
- New subscriber → **not** delivered by PubSubHubbub; use **YouTube Analytics / channel stats polling** and derive “new subscriber” from delta, then emit `youtube:new_subscriber`.  
- Post published confirmation → from upload API response; no separate webhook needed.

---

# Part 3 — Automation engine

## 3.1 Event → Rule → Action pattern

- **Event**: Internal event type + payload (e.g. `meta:comment`, `youtube:video_uploaded`, `post_published`).  
- **Rule**: Stored workflow (from React Flow JSON: nodes + edges).  
- **Trigger**: Event type matches a trigger node (e.g. “Post Published”, “New Comment”).  
- **Condition**: Optional filters (e.g. engagement &lt; X, no comments, reach &lt; threshold).  
- **Action**: What to do (fetch insights, send notification, create LinkedIn post, flag content).  
- **Delay**: Optional “wait X hours” before next step.

## 3.2 Architecture

- **Event bus**: In-memory `EventEmitter` (or Bull/BullMQ for persistence and scale).  
- **Rule engine**: Load workflow JSON; for each event, find rules whose trigger matches; walk graph from trigger → condition → action (respecting delay nodes).  
- **Action runners**: Platform-specific (call insights API, create post, call notification service, set “flagged” in DB).  
- **Queue**: Recommended for actions (e.g. “fetch insights after 24h”) so the server can restart without losing scheduled work.

## 3.3 Example rules (mapped to workflow JSON)

| Rule idea                         | Trigger        | Condition (optional)     | Action           |
|----------------------------------|----------------|---------------------------|------------------|
| Insights 24h after publish       | Post Published | —                         | Delay 24h → Fetch insights |
| Notify on comment                | New Comment    | —                         | Send notification |
| Cross-post video to LinkedIn     | New YouTube Video | —                     | Create LinkedIn post |
| Flag underperforming            | Post Published | Engagement &lt; X / Reach &lt; threshold | Flag in dashboard |

## 3.4 Extensibility

- **Trigger types**: Enum or registry (e.g. `post_published`, `new_comment`, `youtube_video_uploaded`).  
- **Condition types**: Thresholds (numeric), “no comments”, custom predicates.  
- **Action types**: Fetch insights, notify, create post, flag — each implemented as a small handler in the backend.

---

# Technical implementation summary

| Layer           | Tech / location |
|----------------|------------------|
| Post publishing | Node.js services in `social-connector/publishing/` (Meta, LinkedIn, YouTube) |
| Webhooks        | Express routes `POST /webhooks/meta`, `/webhooks/linkedin`, `/webhooks/youtube`; verify; emit events |
| Automation      | Event emitter + rule engine in `social-connector/automation/`; queue optional (e.g. Bull) |
| Workflow UI     | React Flow in dashboard: Trigger / Condition / Action / Delay nodes; save/load JSON |

---

# Known limitations and workarounds

| Platform  | Limitation | Workaround |
|-----------|------------|------------|
| Meta      | Comment/mention webhooks sometimes not firing | Poll comments endpoint on a schedule; emit events from poller |
| Meta      | Media must be publicly accessible URL | Host media on CDN or use Facebook resumable upload |
| LinkedIn  | No feed “comment/like” webhooks | Poll activity/insights; emit events from automation job |
| LinkedIn  | Deprecated ugcPosts | Use versioned Posts API only |
| YouTube   | New subscriber not in PubSubHubbub | Poll channel statistics; compute delta; emit `youtube:new_subscriber` |
| YouTube   | Unverified app → private-only uploads | Request verification for public uploads |
| All       | Rate limits | Backoff, queue, and batch where possible |

---

# References

- [Instagram Content Publishing](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing/)  
- [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)  
- [YouTube videos.insert](https://developers.google.com/youtube/v3/docs/videos/insert), [Resumable uploads](https://developers.google.com/youtube/v3/guides/using_resumable_upload_protocol)  
- [Instagram Webhooks](https://developers.facebook.com/docs/instagram-api/guides/webhooks)  
- [LinkedIn Webhooks](https://learn.microsoft.com/en-us/linkedin/shared/api-guide/webhook-validation)  
- [YouTube Push Notifications](https://developers.google.com/youtube/v3/guides/push_notifications)
