/**
 * LinkedIn – post list and analytics via REST API.
 */
const axios = require('axios');
const config = require('../config');
const linkedinOauth = require('../oauth/linkedin.oauth');

const apiBase = 'https://api.linkedin.com/v2';

async function getTokens(userId = 'default') {
  const tokens = linkedinOauth.getValidTokens(userId);
  if (!tokens) {
    throw new Error('Not authenticated with LinkedIn. Complete OAuth at GET /auth/linkedin first.');
  }
  return tokens;
}

async function getMemberPosts(accessToken, count = 25) {
  const meRes = await axios.get(`${apiBase}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });
  const authorUrn = meRes.data.id;
  if (!authorUrn) return [];

  const { data } = await axios.get(`${apiBase}/ugcPosts`, {
    params: {
      q: 'authors',
      authors: `List(${authorUrn})`,
      count,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });
  return data.elements || [];
}

async function getPostAnalytics(accessToken, postUrn) {
  try {
    const { data } = await axios.get(
      'https://api.linkedin.com/rest/organizationalEntityShareStatistics',
      {
        params: { q: 'organizationalEntity', organizationalEntity: postUrn },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': '202401',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );
    return data.elements || [];
  } catch (err) {
    if (err.response && (err.response.status === 403 || err.response.status === 404)) {
      return [];
    }
    throw err;
  }
}

async function getLinkedInInsights(userId = 'default') {
  const { accessToken } = await getTokens(userId);

  let posts = [];
  try {
    posts = await getMemberPosts(accessToken);
  } catch (err) {
    if (err.response && err.response.status === 403) {
      return {
        connected: true,
        message: 'Connected but post list requires additional LinkedIn permissions.',
        posts: [],
      };
    }
    throw err;
  }

  const withStats = [];
  for (const post of posts.slice(0, 20)) {
    const urn = post.id || post.urn;
    let stats = { impressions: 0, reactions: 0, clicks: 0 };
    if (urn) {
      const analytics = await getPostAnalytics(accessToken, urn);
      const first = analytics[0];
      if (first) {
        stats = {
          impressions: first.impressionCount ?? 0,
          reactions: first.likeCount ?? first.reactionCount ?? 0,
          clicks: first.clickCount ?? 0,
        };
      }
    }
    withStats.push({
      id: urn,
      text: post.commentary || post.specificContent?.com.linkedin.ugc.ShareContent?.shareCommentary?.text,
      createdAt: post.createdAt,
      ...stats,
    });
  }

  return {
    connected: true,
    posts: withStats,
  };
}

module.exports = {
  getMemberPosts,
  getPostAnalytics,
  getLinkedInInsights,
};
