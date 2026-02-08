import type { WorkflowJSON } from './types';

/**
 * Sample workflow: When post is published → wait 24h → fetch insights.
 */
export const sampleWorkflow: WorkflowJSON = {
  nodes: [
    {
      id: 'trigger-1',
      type: 'trigger',
      position: { x: 80, y: 120 },
      data: { triggerType: 'post_published', label: 'Post Published' },
    },
    {
      id: 'delay-1',
      type: 'delay',
      position: { x: 320, y: 120 },
      data: { delayHours: 24, label: 'Wait 24 hours' },
    },
    {
      id: 'action-1',
      type: 'action',
      position: { x: 540, y: 120 },
      data: { actionType: 'fetch_insights', label: 'Fetch insights' },
    },
  ],
  edges: [
    { id: 'e-t1-d1', source: 'trigger-1', target: 'delay-1' },
    { id: 'e-d1-a1', source: 'delay-1', target: 'action-1' },
  ],
};

/**
 * Empty workflow for new flows.
 */
export const emptyWorkflow: WorkflowJSON = {
  nodes: [],
  edges: [],
};
