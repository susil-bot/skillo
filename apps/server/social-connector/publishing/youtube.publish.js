/**
 * YouTube publishing – upload video, set title/description/tags.
 * Scope: https://www.googleapis.com/auth/youtube.upload (or youtube.force-ssl)
 * Uses resumable upload for larger files; simple upload for small.
 */
const axios = require('axios');
const config = require('../config');
const youtubeOauth = require('../oauth/youtube.oauth');

const uploadBase = 'https://www.googleapis.com/upload/youtube/v3/videos';

async function getAccessToken(userId = 'default') {
  const tokens = await youtubeOauth.getValidTokens(userId);
  if (!tokens) throw new Error('Not authenticated with YouTube. Complete OAuth first.');
  return tokens.accessToken;
}

/**
 * Simple upload: metadata + small body. For larger files use resumable (init session, PUT chunks).
 * @param {string} userId
 * @param {Object} opts - { title, description?, tags?: string[], privacyStatus?, videoBuffer?, contentType? }
 * @param {Buffer} [videoBuffer] - optional; if not provided, only metadata is sent (for resumable flow step 1)
 */
async function uploadVideo(userId, opts = {}) {
  const token = await getAccessToken(userId);
  const snippet = {
    title: opts.title || 'Untitled',
    description: opts.description || '',
    tags: opts.tags || [],
  };
  const status = {
    privacyStatus: opts.privacyStatus || 'private',
    publishAt: opts.publishAt || undefined,
  };
  const body = JSON.stringify({ snippet, status });

  if (!opts.videoBuffer || opts.videoBuffer.length === 0) {
    const { data } = await axios.post(
      `${uploadBase}?uploadType=multipart&part=snippet,status`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { videoId: data.id };
  }

  const boundary = 'skillo_upload_boundary';
  const contentType = opts.contentType || 'video/mp4';
  const multipart = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    body,
    `--${boundary}`,
    `Content-Type: ${contentType}`,
    '',
    opts.videoBuffer.toString('binary'),
    `--${boundary}--`,
  ].join('\r\n');

  const { data } = await axios.post(
    `${uploadBase}?uploadType=multipart&part=snippet,status`,
    multipart,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(multipart),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    }
  );
  return { videoId: data.id };
}

/**
 * Initiate resumable upload session (for large files). Returns upload URI for subsequent PUT of chunks.
 */
async function initResumableUpload(userId, opts = {}) {
  const token = await getAccessToken(userId);
  const snippet = {
    title: opts.title || 'Untitled',
    description: opts.description || '',
    tags: opts.tags || [],
  };
  const status = {
    privacyStatus: opts.privacyStatus || 'private',
    publishAt: opts.publishAt || undefined,
  };
  const { headers } = await axios.post(
    `${uploadBase}?uploadType=resumable&part=snippet,status`,
    { snippet, status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Length': opts.contentLength || '0',
        'X-Upload-Content-Type': opts.contentType || 'video/mp4',
      },
      validateStatus: (s) => s === 200,
    }
  );
  const location = headers['location'];
  if (!location) throw new Error('Resumable upload init failed');
  return { uploadUri: location };
}

module.exports = {
  getAccessToken,
  uploadVideo,
  initResumableUpload,
};
