/**
 * Meta (Facebook + Instagram) – post list and insights via Graph API.
 */
const axios = require('axios');
const config = require('../config');
const metaOauth = require('../oauth/meta.oauth');

const graphBase = config.meta.graphBase;

async function getTokens(userId = 'default') {
  const tokens = metaOauth.getValidTokens(userId);
  if (!tokens) {
    throw new Error('Not authenticated with Meta. Complete OAuth at GET /auth/meta first.');
  }
  return tokens;
}

async function getPages(accessToken) {
  const { data } = await axios.get(`${graphBase}/me/accounts`, {
    params: {
      access_token: accessToken,
      fields: 'id,name,access_token,instagram_business_account',
    },
  });
  return data.data || [];
}

async function getInstagramAccountId(accessToken) {
  const pages = await getPages(accessToken);
  for (const page of pages) {
    if (page.instagram_business_account) {
      const igId =
        typeof page.instagram_business_account === 'object'
          ? page.instagram_business_account.id
          : page.instagram_business_account;
      return { igId, pageId: page.id, pageAccessToken: page.access_token };
    }
  }
  return null;
}

async function getInstagramMedia(igId, pageAccessToken, limit = 25) {
  const { data } = await axios.get(
    `${graphBase}/${igId}/media`,
    {
      params: {
        access_token: pageAccessToken,
        fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
        limit,
      },
    }
  );
  return data.data || [];
}

async function getMediaInsights(mediaId, pageAccessToken) {
  const metrics = 'likes,comments,impressions,reach,saved';
  try {
    const { data } = await axios.get(
      `${graphBase}/${mediaId}/insights`,
      {
        params: {
          access_token: pageAccessToken,
          metric: metrics,
        },
      }
    );
    const byName = {};
    (data.data || []).forEach((m) => {
      byName[m.name] = m.values && m.values[0] ? m.values[0].value : 0;
    });
    return byName;
  } catch (err) {
    if (err.response && err.response.status === 400) {
      return {};
    }
    throw err;
  }
}

async function getInstagramInsights(userId = 'default') {
  const { accessToken } = await getTokens(userId);
  const igAccount = await getInstagramAccountId(accessToken);
  if (!igAccount) {
    return {
      connected: false,
      message: 'No Instagram Business Account linked to your Facebook Page.',
      posts: [],
    };
  }

  const mediaList = await getInstagramMedia(
    igAccount.igId,
    igAccount.pageAccessToken
  );
  const posts = [];
  for (const m of mediaList.slice(0, 20)) {
    const insights = await getMediaInsights(m.id, igAccount.pageAccessToken);
    posts.push({
      id: m.id,
      caption: m.caption,
      media_type: m.media_type,
      media_url: m.media_url,
      permalink: m.permalink,
      timestamp: m.timestamp,
      likes: insights.likes ?? 0,
      comments: insights.comments ?? 0,
      impressions: insights.impressions ?? 0,
      reach: insights.reach ?? 0,
      saved: insights.saved ?? 0,
    });
  }

  return {
    connected: true,
    igAccountId: igAccount.igId,
    posts,
  };
}

module.exports = {
  getPages,
  getInstagramAccountId,
  getInstagramMedia,
  getMediaInsights,
  getInstagramInsights,
};
