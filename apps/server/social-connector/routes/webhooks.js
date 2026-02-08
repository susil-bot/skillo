/**
 * Webhook routes – POST /webhooks/meta, /webhooks/linkedin, /webhooks/youtube
 * Verification (GET) for Meta and LinkedIn; POST handlers parse and emit to automation bus.
 */
const express = require('express');
const crypto = require('crypto');
const config = require('../config');
const {
  handleMetaPayload,
  handleLinkedInPayload,
  handleYouTubePayload,
} = require('../webhooks/handlers');

const router = express.Router();

// Raw body needed for signature verification (Meta, LinkedIn). Use express.raw for /webhooks/* or parse JSON.
router.use(express.json({ type: ['application/json'] }));
router.use(express.text({ type: ['application/xml', 'text/xml', 'text/plain'] }));

// --- Meta (Instagram / Facebook) ---
const META_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || 'skillo_verify';

router.get('/meta', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.status(403).send('Forbidden');
});

router.post('/meta', (req, res) => {
  res.status(200).send('OK');
  if (req.body?.object) {
    try {
      handleMetaPayload(req.body);
    } catch (e) {
      console.warn('Meta webhook parse error:', e.message);
    }
  }
});

// --- LinkedIn ---
function verifyLinkedInSignature(body, signature, secret) {
  if (!secret || !signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const expected = hmac.digest('base64');
  return signature === expected;
}

router.get('/linkedin', (req, res) => {
  const challenge = req.query?.challenge;
  if (challenge) return res.status(200).send(challenge);
  res.status(400).send('Bad Request');
});

router.post('/linkedin', (req, res) => {
  const signature = req.headers['x-li-signature'];
  const secret = config.linkedin.clientSecret;
  const body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
  if (secret && signature && !verifyLinkedInSignature(body, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  res.status(200).send('OK');
  try {
    handleLinkedInPayload(req.body, req.headers);
  } catch (e) {
    console.warn('LinkedIn webhook parse error:', e.message);
  }
});

// --- YouTube (PubSubHubbub) ---
router.post('/youtube', (req, res) => {
  res.status(200).send('OK');
  const raw = typeof req.body === 'string' ? req.body : (req.body && req.rawBody) || '';
  try {
    handleYouTubePayload(raw);
  } catch (e) {
    console.warn('YouTube webhook parse error:', e.message);
  }
});

module.exports = router;
