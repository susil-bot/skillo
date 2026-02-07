/**
 * Meta (Facebook + Instagram) OAuth 2.0 – 3-legged flow.
 */
const axios = require('axios');
const config = require('../config');
const store = require('../store');

const PLATFORM = 'meta';

function getAuthUrl(state = 'default') {
  const { clientId, redirectUri, authUrl, scopes } = config.meta;
  if (!clientId || !redirectUri) {
    throw new Error('META_APP_ID and META_REDIRECT_URI must be set');
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    state,
  });
  return `${authUrl}?${params.toString()}`;
}

async function exchangeCodeForTokens(code, userId = 'default') {
  const { clientId, clientSecret, redirectUri, tokenUrl } = config.meta;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Meta OAuth config incomplete');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
    grant_type: 'authorization_code',
  });

  const { data } = await axios.get(`${tokenUrl}?${params.toString()}`);
  if (data.error) {
    throw new Error(data.error.message || 'Meta token exchange failed');
  }

  let accessToken = data.access_token;
  let expiresAt = null;

  if (data.expires_in) {
    const longLivedUrl = `${config.meta.graphBase}/oauth/access_token`;
    const longParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: clientId,
      client_secret: clientSecret,
      fb_exchange_token: accessToken,
    });
    const longRes = await axios.get(`${longLivedUrl}?${longParams.toString()}`);
    if (longRes.data.access_token) {
      accessToken = longRes.data.access_token;
      expiresAt = longRes.data.expires_in
        ? new Date(Date.now() + longRes.data.expires_in * 1000).toISOString()
        : null;
    }
  }

  const tokenData = {
    accessToken,
    refreshToken: null,
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
