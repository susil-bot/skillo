/**
 * Social Connector – central config from environment.
 * All client IDs, secrets, and redirect URIs for OAuth and API calls.
 */
require('dotenv').config();

const baseUrl = process.env.BASE_URL || 'http://localhost:4000';

module.exports = {
  port: parseInt(process.env.PORT || '4000', 10),

  baseUrl,

  // --- Meta (Facebook + Instagram Business / Creator) ---
  meta: {
    clientId: process.env.META_APP_ID,
    clientSecret: process.env.META_APP_SECRET,
    redirectUri: process.env.META_REDIRECT_URI || `${baseUrl}/auth/meta/callback`,
    // Facebook Login for Pages + Instagram; long-lived token exchange
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    graphBase: 'https://graph.facebook.com/v18.0',
    instagramGraphBase: 'https://graph.instagram.com',
    scopes: [
      'pages_show_list',
      'pages_read_engagement',
      'instagram_basic',
      'instagram_manage_insights',
    ].join(','),
  },

  // --- LinkedIn ---
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/auth/linkedin/callback`,
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    apiBase: 'https://api.linkedin.com/rest',
    scopes: ['openid', 'profile', 'w_member_social', 'r_organization_social'].join(' '),
  },

  // --- YouTube (Google OAuth) ---
  youtube: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${baseUrl}/auth/youtube/callback`,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    youtubeDataBase: 'https://www.googleapis.com/youtube/v3',
    youtubeAnalyticsBase: 'https://youtubeanalytics.googleapis.com/v2/reports',
    scopes: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.analytics.readonly',
    ].join(' '),
  },
};
