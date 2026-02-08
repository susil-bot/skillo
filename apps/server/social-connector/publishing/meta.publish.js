/**
 * Meta (Instagram) publishing – image, carousel, reel.
 * Media must be publicly accessible URLs. Uses Page token for IG Business.
 * Scopes: instagram_basic, instagram_content_publish, pages_read_engagement.
 */
const axios = require('axios');
const config = require('../config');
const metaOauth = require('../oauth/meta.oauth');
const metaService = require('../services/meta.service');

const graphBase = config.meta.graphBase;

async function getPageToken(userId = 'default') {
  const tokens = metaOauth.getValidTokens(userId);
  if (!tokens) throw new Error('Not authenticated with Meta. Complete OAuth first.');
  const pages = await metaService.getPages(tokens.accessToken);
  const withIg = pages.find((p) => p.instagram_business_account);
  if (!withIg) throw new Error('No Instagram Business Account linked.');
  return {
    pageAccessToken: withIg.access_token,
    pageId: withIg.id,
    igAccountId:
      typeof withIg.instagram_business_account === 'object'
        ? withIg.instagram_business_account.id
        : withIg.instagram_business_account,
  };
}

/**
 * Create media container (image or reel). Does not publish yet.
 * @param {Object} opts - { userId, imageUrl?, videoUrl?, caption?, mediaType: 'IMAGE'|'VIDEO'|'REELS' }
 */
async function createMediaContainer(userId, opts) {
  const { pageAccessToken, igAccountId } = await getPageToken(userId);
  const isVideo = opts.mediaType === 'VIDEO' || opts.mediaType === 'REELS';
  const url = isVideo ? opts.videoUrl : opts.imageUrl;
  if (!url) throw new Error(isVideo ? 'videoUrl required' : 'imageUrl required');

  const params = {
    access_token: pageAccessToken,
    media_type: opts.mediaType || (isVideo ? 'REELS' : 'IMAGE'),
    [isVideo ? 'video_url' : 'image_url']: url,
  };
  if (opts.caption) params.caption = opts.caption;
  if (opts.altText) params.alt_text_custom = opts.altText;

  const { data } = await axios.post(
    `${graphBase}/${igAccountId}/media`,
    null,
    { params }
  );
  if (!data.id) throw new Error(data.error?.message || 'Failed to create container');
  return { containerId: data.id, igAccountId };
}

/**
 * Publish a container (or create and publish in one flow).
 */
async function publishContainer(userId, containerId, igAccountId) {
  const { pageAccessToken } = await getPageToken(userId);
  const aid = igAccountId || (await getPageToken(userId)).igAccountId;

  const { data } = await axios.post(
    `${graphBase}/${aid}/media_publish`,
    null,
    {
      params: {
        access_token: pageAccessToken,
        creation_id: containerId,
      },
    }
  );
  if (!data.id) throw new Error(data.error?.message || 'Failed to publish');
  return { mediaId: data.id };
}

/**
 * Publish single image or reel. For carousel use createMediaContainer for each, then carousel API.
 */
async function publishImageOrReel(userId, opts) {
  const { containerId, igAccountId } = await createMediaContainer(userId, opts);
  return publishContainer(userId, containerId, igAccountId);
}

module.exports = {
  getPageToken,
  createMediaContainer,
  publishContainer,
  publishImageOrReel,
};
