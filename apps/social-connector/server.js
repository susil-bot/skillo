/**
 * Social Connector Service – Express server.
 * OAuth routes for Meta, LinkedIn, YouTube; insight routes to fetch analytics.
 */
const express = require('express');
const config = require('./config');

const authRoutes = require('./routes/auth');
const insightsRoutes = require('./routes/insights');

const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'social-connector' });
});

// Mount auth and insights routes
app.use('/auth', authRoutes);
app.use('/insights', insightsRoutes);

const port = config.port;
app.listen(port, () => {
  console.log(`Social Connector running at http://localhost:${port}`);
  console.log(`  Auth: GET /auth/meta, /auth/linkedin, /auth/youtube (then /callback)`);
  console.log(`  Insights: GET /insights/instagram, /insights/linkedin, /insights/youtube`);
});
