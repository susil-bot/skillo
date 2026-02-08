/**
 * Webhook payload handlers – parse platform payloads and emit internal events for the automation engine.
 * Events: meta:comment, meta:mention, linkedin:*, youtube:video_uploaded, etc.
 */
const { getAutomationBus } = require('../automation/engine');

function emit(eventType, payload) {
  try {
    const bus = getAutomationBus();
    if (bus) bus.emit(eventType, payload);
  } catch (e) {
    console.warn('Webhook emit failed:', e.message);
  }
}

/**
 * Meta: verify token GET; POST body has object, entry[].changes or entry[].messaging.
 */
function handleMetaPayload(body) {
  if (!body || body.object !== 'instagram') return;
  const entries = body.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const field = change.field;
      const value = change.value;
      if (field === 'comments') {
        emit('meta:comment', {
          platform: 'meta',
          igUserId: entry.id,
          mediaId: value?.media?.id,
          commentId: value?.id,
          text: value?.text,
          from: value?.from,
          timestamp: value?.timestamp,
        });
      }
      if (field === 'mentions') {
        emit('meta:mention', {
          platform: 'meta',
          igUserId: entry.id,
          mediaId: value?.media?.id,
          mention: value,
        });
      }
    }
  }
}

/**
 * LinkedIn: validation uses hub challenge; events vary by product (e.g. job application).
 */
function handleLinkedInPayload(body, headers = {}) {
  if (body?.challenge) return; // validation response handled in route
  const eventType = headers['x-li-event-type'] || body?.eventType;
  if (eventType) {
    emit('linkedin:event', {
      platform: 'linkedin',
      eventType,
      ...body,
    });
  }
}

/**
 * YouTube PubSubHubbub: Atom feed with yt:videoId, yt:channelId.
 */
function handleYouTubePayload(rawBody) {
  if (typeof rawBody !== 'string') return;
  const channelId = rawBody.match(/<yt:channelId>([^<]+)<\/yt:channelId>/)?.[1];
  const videoId = rawBody.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
  const link = rawBody.match(/<link[^>]+href="([^"]+)"/)?.[1];
  if (videoId && channelId) {
    emit('youtube:video_uploaded', {
      platform: 'youtube',
      channelId,
      videoId,
      link,
    });
  }
}

module.exports = {
  emit,
  handleMetaPayload,
  handleLinkedInPayload,
  handleYouTubePayload,
};
