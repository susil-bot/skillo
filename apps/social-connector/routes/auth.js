/**
 * OAuth routes – initiate flow and handle callback (code → tokens).
 * Optional query: ?userId=xxx to scope tokens per user (default: 'default').
 */
const express = require('express');
const router = express.Router();
const metaOauth = require('../oauth/meta.oauth');
const linkedinOauth = require('../oauth/linkedin.oauth');
const youtubeOauth = require('../oauth/youtube.oauth');

function userId(req) {
  return req.query.userId || 'default';
}

// --- Meta (Facebook + Instagram) ---
router.get('/meta', (req, res) => {
  try {
    const state = userId(req);
    const url = metaOauth.getAuthUrl(state);
    return res.redirect(url);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/meta/callback', async (req, res) => {
  const { code, state, error } = req.query;
  if (error) {
    return res.status(400).send(`Meta OAuth error: ${error}`);
  }
  if (!code) {
    return res.status(400).send('Missing code');
  }
  try {
    await metaOauth.exchangeCodeForTokens(code, state || 'default');
    return res.send('Meta connected. You can close this tab and return to Skillo.');
  } catch (err) {
    return res.status(500).send(`Token exchange failed: ${err.message}`);
  }
});

// --- LinkedIn ---
router.get('/linkedin', (req, res) => {
  try {
    const state = userId(req);
    const url = linkedinOauth.getAuthUrl(state);
    return res.redirect(url);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/linkedin/callback', async (req, res) => {
  const { code, state, error } = req.query;
  if (error) {
    return res.status(400).send(`LinkedIn OAuth error: ${error}`);
  }
  if (!code) {
    return res.status(400).send('Missing code');
  }
  try {
    await linkedinOauth.exchangeCodeForTokens(code, state || 'default');
    return res.send('LinkedIn connected. You can close this tab and return to Skillo.');
  } catch (err) {
    return res.status(500).send(`Token exchange failed: ${err.message}`);
  }
});

// --- YouTube (Google) ---
router.get('/youtube', (req, res) => {
  try {
    const state = userId(req);
    const url = youtubeOauth.getAuthUrl(state);
    return res.redirect(url);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/youtube/callback', async (req, res) => {
  const { code, state, error } = req.query;
  if (error) {
    return res.status(400).send(`Google OAuth error: ${error}`);
  }
  if (!code) {
    return res.status(400).send('Missing code');
  }
  try {
    await youtubeOauth.exchangeCodeForTokens(code, state || 'default');
    return res.send('YouTube connected. You can close this tab and return to Skillo.');
  } catch (err) {
    return res.status(500).send(`Token exchange failed: ${err.message}`);
  }
});

module.exports = router;
