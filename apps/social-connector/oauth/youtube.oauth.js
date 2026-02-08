/**
 * YouTube (Google) OAuth 2.0 – 3-legged flow.
 * Redirect to Google consent; exchange code for access_token and refresh_token.
 * Auto-refresh access_token using refresh_token when expired.
 */
const axios = require('axios');
const config = require('../config');
const store = require('../store');

const PLATFORM = 'youtube';

function getAuthUrl(state = 'default') {
  const { clientId, redirectUri, authUrl, scopes } = config.youtube;
  if (!clientId || !redirectUri) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI must be set');
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  return `${authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access_token and refresh_token.
 */
async function exchangeCodeForTokens(code, userId = 'default') {
  const { clientId, clientSecret, redirectUri, tokenUrl } = config.youtube;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('YouTube OAuth config incomplete');
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const { data } = await axios.post(tokenUrl, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (data.error) {
    throw new Error(data.error_description || data.error || 'Google token exchange failed');
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

/**
 * Refresh access_token using refresh_token (Google supports this).
 */
async function refreshAccessToken(userId = 'default') {
  const data = store.get(PLATFORM, userId);
  if (!data || !data.refreshToken) return null;

  const { clientId, clientSecret, tokenUrl } = config.youtube;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: data.refreshToken,
    grant_type: 'refresh_token',
  });

  const res = await axios.post(tokenUrl, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (res.data.error) return null;

  const expiresAt = res.data.expires_in
    ? new Date(Date.now() + res.data.expires_in * 1000).toISOString()
    : null;

  const newData = {
    accessToken: res.data.access_token,
    refreshToken: data.refreshToken,
    expiresAt,
  };
  store.set(PLATFORM, userId, newData);
  return newData;
}

/**
 * Return valid tokens; if expired and we have refresh_token, refresh first.
 */
async function getValidTokens(userId = 'default') {
  let data = store.get(PLATFORM, userId);
  if (!data || !data.accessToken) return null;

  const expired = data.expiresAt && new Date(data.expiresAt) <= new Date();
  if (expired && data.refreshToken) {
    data = await refreshAccessToken(userId);
  } else if (expired) {
    return null;
  }

  return data;
}

module.exports = {
  getAuthUrl,
  exchangeCodeForTokens,
  getValidTokens,
  refreshAccessToken,
  PLATFORM,
};
