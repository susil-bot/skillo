import type { TriggerType, ConditionType, ActionType } from './types';

export const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: 'post_published', label: 'Post Published' },
  { value: 'new_comment', label: 'New Comment' },
  { value: 'new_youtube_video', label: 'New YouTube Video' },
  { value: 'new_like', label: 'New Like' },
  { value: 'new_subscriber', label: 'New Subscriber' },
];

export const CONDITION_OPTIONS: { value: ConditionType; label: string }[] = [
  { value: 'always', label: 'Always' },
  { value: 'engagement_less_than', label: 'Engagement less than X' },
  { value: 'no_comments', label: 'No comments' },
  { value: 'reach_below', label: 'Reach below threshold' },
];

export const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'fetch_insights', label: 'Fetch insights' },
  { value: 'send_notification', label: 'Send notification' },
  { value: 'create_linkedin_post', label: 'Create LinkedIn post' },
  { value: 'flag_content', label: 'Flag content' },
];
