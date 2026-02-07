export type BrandTone =
  | 'friendly'
  | 'bold'
  | 'educational'
  | 'premium'
  | 'playful'
  | 'professional'
  | 'inspirational'
  | 'minimal'
  | 'conversational';

export type ContentGoal = 'awareness' | 'leads' | 'trust' | 'education' | 'engagement' | 'sales';

export type Platform =
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'blog'
  | 'x'
  | 'tiktok'
  | 'newsletter'
  | 'podcast'
  | 'other';

export interface BrandProfile {
  brandName: string;
  targetAudience: string;
  brandTone: BrandTone;
  contentGoals: ContentGoal[];
  primaryPlatforms: Platform[];
  contentPillars: string[];
  campaigns?: string[];
  schemaVersion?: number;
  updatedAt?: string;
}

export type ContentType =
  | 'reel'
  | 'post'
  | 'blog'
  | 'thread'
  | 'video'
  | 'story'
  | 'carousel'
  | 'short'
  | 'article'
  | 'newsletter'
  | 'other';

export type ContentStatus = 'idea' | 'draft' | 'scheduled' | 'published' | 'archived';

export interface ContentCard {
  id: string;
  title: string;
  platform: Platform;
  contentType: ContentType;
  hook?: string;
  keyMessage?: string;
  cta?: string;
  relatedPillar?: string;
  goal?: ContentGoal;
  campaign?: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
}

export type RelationshipGroupBy = 'pillar' | 'goal' | 'campaign' | 'platform';

export type CspView = 'brand' | 'planner' | 'visualization' | 'platforms';
