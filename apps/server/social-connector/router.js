/**
 * Single Express router for Social Connector – health, auth, insights, publish, webhooks.
 * Mounted on the main server via Vendure apiOptions.middleware.
 */
const express = require('express');

const authRoutes = require('./routes/auth');
const insightsRoutes = require('./routes/insights');
const webhooksRoutes = require('./routes/webhooks');
const publishRoutes = require('./routes/publish');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'social-connector', integrated: true });
});

router.use('/auth', authRoutes);
router.use('/insights', insightsRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/publish', publishRoutes);

module.exports = { router };
