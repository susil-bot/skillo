/**
 * Insights routes – fetch post list and analytics per platform.
 * Optional query: ?userId=xxx (must match the userId used during OAuth).
 */
const express = require('express');
const router = express.Router();
const metaService = require('../services/meta.service');
const linkedinService = require('../services/linkedin.service');
const youtubeService = require('../services/youtube.service');

function userId(req) {
  return req.query.userId || 'default';
}

// GET /insights/instagram – Instagram posts + likes, comments, impressions, reach
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

// GET /insights/linkedin – LinkedIn posts + impressions, reactions, clicks
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

// GET /insights/youtube – YouTube channel + videos with views, likes, comments, watch time
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
