/**
 * Publish routes – POST to create/publish content.
 * Optional ?userId=xxx.
 */
const express = require('express');
const router = express.Router();
const metaPublish = require('../publishing/meta.publish');
const linkedinPublish = require('../publishing/linkedin.publish');
const youtubePublish = require('../publishing/youtube.publish');

function userId(req) {
  return req.query.userId || req.body?.userId || 'default';
}

// --- Meta (Instagram) ---
router.post('/instagram/image', async (req, res) => {
  try {
    const u = userId(req);
    const { imageUrl, caption, altText } = req.body || {};
    const result = await metaPublish.publishImageOrReel(u, {
      imageUrl,
      caption,
      altText,
      mediaType: 'IMAGE',
    });
    return res.json(result);
  } catch (err) {
    if (err.message?.includes('Not authenticated')) return res.status(401).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
});

router.post('/instagram/reel', async (req, res) => {
  try {
    const u = userId(req);
    const { videoUrl, caption } = req.body || {};
    const result = await metaPublish.publishImageOrReel(u, {
      videoUrl,
      caption,
      mediaType: 'REELS',
    });
    return res.json(result);
  } catch (err) {
    if (err.message?.includes('Not authenticated')) return res.status(401).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
});

// --- LinkedIn ---
router.post('/linkedin', async (req, res) => {
  try {
    const u = userId(req);
    const { text } = req.body || {};
    const result = await linkedinPublish.createTextPost(u, { text: text || '' });
    return res.json(result);
  } catch (err) {
    if (err.message?.includes('Not authenticated')) return res.status(401).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
});

// --- YouTube ---
router.post('/youtube', async (req, res) => {
  try {
    const u = userId(req);
    const { title, description, tags, privacyStatus, videoBuffer, contentType } = req.body || {};
    const result = await youtubePublish.uploadVideo(u, {
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      privacyStatus: privacyStatus || 'private',
      videoBuffer: videoBuffer ? Buffer.from(videoBuffer) : undefined,
      contentType,
    });
    return res.json(result);
  } catch (err) {
    if (err.message?.includes('Not authenticated')) return res.status(401).json({ error: err.message });
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
