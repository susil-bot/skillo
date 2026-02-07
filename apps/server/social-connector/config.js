/**
 * Social Connector – config from environment.
 * Use the main server URL for OAuth redirects (same host/port as backend).
 */
const port = +(process.env.PORT || 3000);
const baseUrl = process.env.BASE_URL || process.env.SOCIAL_CONNECTOR_BASE_URL || `http://localhost:${port}`;

module.exports = {
  baseUrl,

  meta: {
    clientId: process.env.META_APP_ID,
    clientSecret: process.env.META_APP_SECRET,
    redirectUri: process.env.META_REDIRECT_URI || `${baseUrl}/auth/meta/callback`,
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

  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${baseUrl}/auth/linkedin/callback`,
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    apiBase: 'https://api.linkedin.com/rest',
    scopes: ['openid', 'profile', 'w_member_social', 'r_organization_social'].join(' '),
  },

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
