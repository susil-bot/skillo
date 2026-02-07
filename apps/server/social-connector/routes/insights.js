/**
 * Insights routes – fetch post list and analytics per platform. Optional ?userId=xxx.
 */
const express = require('express');
const router = express.Router();
const metaService = require('../services/meta.service');
const linkedinService = require('../services/linkedin.service');
const youtubeService = require('../services/youtube.service');

function userId(req) {
  return req.query.userId || 'default';
}

router.get('/instagram', async (req, res) => {
  try {
    const data = await metaService.getInstagramInsights(userId(req));
    return res.json(data);
  } catch (err) {
    if (err.message && err.message.includes('Not authenticated')) {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

router.get('/linkedin', async (req, res) => {
  try {
    const data = await linkedinService.getLinkedInInsights(userId(req));
    return res.json(data);
  } catch (err) {
    if (err.message && err.message.includes('Not authenticated')) {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

router.get('/youtube', async (req, res) => {
  try {
    const data = await youtubeService.getYouTubeInsights(userId(req));
    return res.json(data);
  } catch (err) {
    if (err.message && err.message.includes('Not authenticated')) {
      return res.status(401).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
