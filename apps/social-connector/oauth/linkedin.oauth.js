/**
 * LinkedIn OAuth 2.0 – 3-legged flow.
 * Redirect to LinkedIn consent; exchange code for access_token.
 * Store access_token and expires_in; LinkedIn may not return refresh_token for all apps.
 */
const axios = require('axios');
const config = require('../config');
const store = require('../store');

const PLATFORM = 'linkedin';

function getAuthUrl(state = 'default') {
  const { clientId, redirectUri, authUrl, scopes } = config.linkedin;
  if (!clientId || !redirectUri) {
    throw new Error('LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI must be set');
  }
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    state,
  });
  return `${authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access_token (POST form body).
 */
async function exchangeCodeForTokens(code, userId = 'default') {
  const { clientId, clientSecret, redirectUri, tokenUrl } = config.linkedin;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('LinkedIn OAuth config incomplete');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const { data } = await axios.post(tokenUrl, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (data.error) {
    throw new Error(data.error_description || data.error || 'LinkedIn token exchange failed');
  }

  const expiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000).toISOString()
    : null;

  const tokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresAt,
  };
  store.set(PLATFORM, userId, tokenData);
  return tokenData;
}

function getValidTokens(userId = 'default') {
  const data = store.get(PLATFORM, userId);
  if (!data || !data.accessToken) return null;
  if (data.expiresAt && new Date(data.expiresAt) <= new Date()) {
    return null;
  }
  return data;
}

module.exports = {
  getAuthUrl,
  exchangeCodeForTokens,
  getValidTokens,
  PLATFORM,
};
