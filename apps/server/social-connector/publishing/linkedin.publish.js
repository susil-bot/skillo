/**
 * LinkedIn publishing – text, image, video via Posts API.
 * Scopes: w_member_social (personal), w_organization_social (org).
 * Uses versioned REST API: LinkedIn-Version, X-Restli-Protocol-Version.
 */
const axios = require('axios');
const linkedinOauth = require('../oauth/linkedin.oauth');

const apiBase = 'https://api.linkedin.com/rest';
const VERSION = '202401';

async function getAccessToken(userId = 'default') {
  const tokens = linkedinOauth.getValidTokens(userId);
  if (!tokens) throw new Error('Not authenticated with LinkedIn. Complete OAuth first.');
  return tokens.accessToken;
}

/**
 * Get current member URN (Person URN) for author field.
 */
async function getMe(userId) {
  const token = await getAccessToken(userId);
  const { data } = await axios.get('https://api.linkedin.com/v2/me', {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });
  const urn = data.id; // e.g. urn:li:person:xxx
  if (!urn) throw new Error('Could not get member URN');
  return urn;
}

/**
 * Create a text-only post (personal).
 * @param {string} userId
 * @param {Object} opts - { text }
 */
async function createTextPost(userId, opts) {
  const token = await getAccessToken(userId);
  const author = await getMe(userId);

  const body = {
    author: author,
    lifecycleState: 'PUBLISHED',
    visibility: 'PUBLIC',
    commentary: opts.text || '',
  };

  const { data } = await axios.post(`${apiBase}/posts`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'LinkedIn-Version': VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
  });
  const postId = data.id || data;
  return { postId };
}

/**
 * Create post with media requires: register asset (image/video), get URN, then post with specificContent.
 * Placeholder for full media flow – returns same shape; implement registerUpload + attach in next iteration.
 */
async function createPostWithMedia(userId, opts) {
  if (!opts.mediaUrn) return createTextPost(userId, { text: opts.text });
  const token = await getAccessToken(userId);
  const author = await getMe(userId);
  const body = {
    author,
    lifecycleState: 'PUBLISHED',
    visibility: opts.visibility || 'PUBLIC',
    commentary: opts.text || '',
    content: {
      contentEntities: [{ entity: opts.mediaUrn }],
    },
  };
  const { data } = await axios.post(`${apiBase}/posts`, body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'LinkedIn-Version': VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
  });
  return { postId: data.id || data };
}

module.exports = {
  getAccessToken,
  getMe,
  createTextPost,
  createPostWithMedia,
};
