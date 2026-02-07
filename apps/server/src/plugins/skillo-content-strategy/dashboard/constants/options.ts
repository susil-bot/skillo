import type { BrandTone, ContentGoal, Platform, ContentType, ContentStatus } from '../types';

export const BRAND_TONE_OPTIONS: { value: BrandTone; label: string }[] = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'bold', label: 'Bold' },
  { value: 'educational', label: 'Educational' },
  { value: 'premium', label: 'Premium' },
  { value: 'playful', label: 'Playful' },
  { value: 'professional', label: 'Professional' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'conversational', label: 'Conversational' },
];

export const CONTENT_GOAL_OPTIONS: { value: ContentGoal; label: string }[] = [
  { value: 'awareness', label: 'Awareness' },
  { value: 'leads', label: 'Leads' },
  { value: 'trust', label: 'Trust' },
  { value: 'education', label: 'Education' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'sales', label: 'Sales' },
];

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'blog', label: 'Blog' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'other', label: 'Other' },
];

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: 'reel', label: 'Reel' },
  { value: 'post', label: 'Post' },
  { value: 'blog', label: 'Blog' },
  { value: 'thread', label: 'Thread' },
  { value: 'video', label: 'Video' },
  { value: 'story', label: 'Story' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'short', label: 'Short' },
  { value: 'article', label: 'Article' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'other', label: 'Other' },
];

export const CONTENT_STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];
