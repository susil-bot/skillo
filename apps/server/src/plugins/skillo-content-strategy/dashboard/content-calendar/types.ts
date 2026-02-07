/**
 * Content Calendar module – cross-platform content orchestration.
 * Aligned with CSP for future API integration.
 */

export type CalendarContentStatus = 'drafting' | 'editing' | 'scheduled' | 'published';

export type CalendarContentType =
  | 'video'
  | 'article'
  | 'thread'
  | 'infographic'
  | 'long-form'
  | 'reel'
  | 'post'
  | 'short'
  | 'other';

export type CalendarViewMode = 'table' | 'kanban' | 'calendar';

export type CalendarFilter = 'all' | 'upcoming';

export interface ContentCalendarItem {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date (YYYY-MM-DD) for scheduling
  platforms: string[];
  status: CalendarContentStatus;
  contentType: CalendarContentType;
  linkedContentIds: string[];
  brandTag?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
