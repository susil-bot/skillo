/**
 * Single Express router for Social Connector – health, auth, insights.
 * Mounted on the main server via Vendure apiOptions.middleware.
 */
const express = require('express');

const authRoutes = require('./routes/auth');
const insightsRoutes = require('./routes/insights');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'social-connector', integrated: true });
});

router.use('/auth', authRoutes);
router.use('/insights', insightsRoutes);

module.exports = { router };
