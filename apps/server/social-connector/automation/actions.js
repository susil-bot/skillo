/**
 * Action runners – called by the rule engine. No queue here; in production use Bull/BullMQ.
 */
const metaService = require('../services/meta.service');
const linkedinService = require('../services/linkedin.service');
const youtubeService = require('../services/youtube.service');
const linkedinPublish = require('../publishing/linkedin.publish');

async function fetchInsights(userId, payload) {
  const platform = payload.platform || payload.insightsPlatform;
  if (platform === 'meta' || platform === 'instagram') {
    return metaService.getInstagramInsights(userId);
  }
  if (platform === 'linkedin') return linkedinService.getLinkedInInsights(userId);
  if (platform === 'youtube') return youtubeService.getYouTubeInsights(userId);
  return null;
}

function sendNotification(payload) {
  console.log('[Automation] Notification:', payload.message || payload);
  return Promise.resolve();
}

async function createLinkedInPost(userId, payload) {
  const text = payload.text || payload.caption || payload.title || 'Check this out';
  return linkedinPublish.createTextPost(userId, { text });
}

function flagContent(payload) {
  console.log('[Automation] Flag content:', payload.mediaId || payload.videoId || payload.postId, payload);
  return Promise.resolve();
}

module.exports = {
  fetchInsights,
  sendNotification,
  createLinkedInPost,
  flagContent,
};
