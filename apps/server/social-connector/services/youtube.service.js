/**
 * YouTube – channel, videos, and analytics via Data API v3 and Analytics API.
 */
const axios = require('axios');
const config = require('../config');
const youtubeOauth = require('../oauth/youtube.oauth');

const dataBase = config.youtube.youtubeDataBase;
const analyticsBase = config.youtube.youtubeAnalyticsBase;

async function getTokens(userId = 'default') {
  const tokens = await youtubeOauth.getValidTokens(userId);
  if (!tokens) {
    throw new Error('Not authenticated with YouTube. Complete OAuth at GET /auth/youtube first.');
  }
  return tokens;
}

async function getMyChannel(accessToken) {
  const { data } = await axios.get(`${dataBase}/channels`, {
    params: { part: 'snippet,statistics', mine: true },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const items = data.items || [];
  return items[0] || null;
}

async function getChannelVideos(accessToken, channelId, maxResults = 25) {
  const playlistRes = await axios.get(`${dataBase}/channels`, {
    params: { part: 'contentDetails', id: channelId },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const uploadsId =
    playlistRes.data.items &&
    playlistRes.data.items[0] &&
    playlistRes.data.items[0].contentDetails &&
    playlistRes.data.items[0].contentDetails.relatedPlaylists &&
    playlistRes.data.items[0].contentDetails.relatedPlaylists.uploads;
  if (!uploadsId) return [];

  const listRes = await axios.get(`${dataBase}/playlistItems`, {
    params: {
      part: 'snippet,contentDetails',
      playlistId: uploadsId,
      maxResults,
    },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return listRes.data.items || [];
}

async function getAnalytics(accessToken, channelId, videoIds = null) {
  const endDate = new Date().toISOString().slice(0, 10);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 28);
  const start = startDate.toISOString().slice(0, 10);

  const params = {
    ids: 'channel=='.concat(channelId),
    startDate: start,
    endDate,
    metrics: 'views,likes,comments,estimatedMinutesWatched',
    dimensions: 'video',
    sort: '-views',
  };
  if (videoIds && videoIds.length) {
    params.filters = 'video=='.concat(videoIds.slice(0, 50).join(','));
  }

  const { data } = await axios.get(analyticsBase, {
    params,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.rows || [];
}

async function getYouTubeInsights(userId = 'default') {
  const { accessToken } = await getTokens(userId);
  const channel = await getMyChannel(accessToken);
  if (!channel) {
    return { connected: true, channel: null, videos: [] };
  }

  const channelId = channel.id;
  const videos = await getChannelVideos(accessToken, channelId);
  const videoIds = videos.map((v) => v.contentDetails?.videoId).filter(Boolean);

  let rows = [];
  try {
    rows = await getAnalytics(accessToken, channelId, videoIds);
  } catch (err) {
    if (err.response && (err.response.status === 403 || err.response.status === 404)) {
      rows = [];
    } else {
      throw err;
    }
  }

  const statsByVideo = {};
  rows.forEach((r) => {
    const [vid, views, likes, comments, minutes] = r;
    statsByVideo[vid] = {
      views: views || 0,
      likes: likes || 0,
      comments: comments || 0,
      estimatedMinutesWatched: minutes || 0,
    };
  });

  const videosWithStats = videos.map((v) => {
    const vid = v.contentDetails?.videoId;
    const stats = statsByVideo[vid] || {
      views: 0,
      likes: 0,
      comments: 0,
      estimatedMinutesWatched: 0,
    };
    return {
      id: vid,
      title: v.snippet?.title,
      publishedAt: v.snippet?.publishedAt,
      thumbnail: v.snippet?.thumbnails?.default?.url,
      ...stats,
    };
  });

  return {
    connected: true,
    channel: {
      id: channel.id,
      title: channel.snippet?.title,
      subscriberCount: channel.statistics?.subscriberCount,
      videoCount: channel.statistics?.videoCount,
    },
    videos: videosWithStats,
  };
}

module.exports = {
  getMyChannel,
  getChannelVideos,
  getAnalytics,
  getYouTubeInsights,
};
