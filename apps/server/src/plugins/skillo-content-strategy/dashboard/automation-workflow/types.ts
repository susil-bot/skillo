/**
 * Workflow JSON shape for automation engine. Backend interprets nodes + edges.
 */
export type TriggerType =
  | 'post_published'
  | 'new_comment'
  | 'new_youtube_video'
  | 'new_like'
  | 'new_subscriber';

export type ConditionType =
  | 'engagement_less_than'
  | 'no_comments'
  | 'reach_below'
  | 'always';

export type ActionType =
  | 'fetch_insights'
  | 'send_notification'
  | 'create_linkedin_post'
  | 'flag_content';

export interface TriggerNodeData {
  label?: string;
  triggerType: TriggerType;
}

export interface ConditionNodeData {
  label?: string;
  conditionType: ConditionType;
  threshold?: number;
  value?: number;
}

export interface ActionNodeData {
  label?: string;
  actionType: ActionType;
  config?: Record<string, unknown>;
}

export interface DelayNodeData {
  label?: string;
  delayHours: number;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  position: { x: number; y: number };
  data: TriggerNodeData | ConditionNodeData | ActionNodeData | DelayNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowJSON {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
