import type { CalendarContentStatus, CalendarContentType } from './types';

export const CALENDAR_STATUS_ORDER: CalendarContentStatus[] = [
  'drafting',
  'editing',
  'scheduled',
  'published',
];

export const CALENDAR_STATUS_OPTIONS: { value: CalendarContentStatus; label: string }[] = [
  { value: 'drafting', label: 'Drafting' },
  { value: 'editing', label: 'Editing' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
];

export const CALENDAR_CONTENT_TYPE_OPTIONS: { value: CalendarContentType; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'article', label: 'Article' },
  { value: 'thread', label: 'Thread' },
  { value: 'infographic', label: 'Infographic' },
  { value: 'long-form', label: 'Long-Form' },
  { value: 'reel', label: 'Reel' },
  { value: 'post', label: 'Post' },
  { value: 'short', label: 'Short' },
  { value: 'other', label: 'Other' },
];

export const PLATFORM_OPTIONS_CALENDAR = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'blog', label: 'Blog' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'other', label: 'Other' },
];
