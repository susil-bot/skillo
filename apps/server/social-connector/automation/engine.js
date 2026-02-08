/**
 * Automation engine – event bus + rule engine.
 * Events from webhooks/publishing are emitted here; rules (workflow JSON) are evaluated and actions run.
 */
const EventEmitter = require('events');

let bus = null;

function getAutomationBus() {
  if (!bus) bus = new EventEmitter();
  return bus;
}

/**
 * Rule definition (from workflow JSON): trigger type, conditions, action type, delay.
 * We interpret nodes: trigger → condition(s) → delay? → action.
 */
const TRIGGER_TYPES = [
  'post_published',
  'new_comment',
  'new_youtube_video',
  'new_like',
  'new_subscriber',
];
const CONDITION_TYPES = ['engagement_less_than', 'no_comments', 'reach_below', 'always'];
const ACTION_TYPES = ['fetch_insights', 'send_notification', 'create_linkedin_post', 'flag_content'];

function getTriggerTypeFromEvent(eventType) {
  const map = {
    'meta:comment': 'new_comment',
    'meta:mention': 'new_comment',
    'meta:like': 'new_like',
    'linkedin:event': null,
    'youtube:video_uploaded': 'new_youtube_video',
    'youtube:new_subscriber': 'new_subscriber',
    post_published: 'post_published',
  };
  return map[eventType] || eventType;
}

/**
 * Evaluate a single condition node against event payload.
 */
function evaluateCondition(conditionNode, payload) {
  const type = conditionNode.data?.conditionType || 'always';
  if (type === 'always') return true;
  const value = conditionNode.data?.value ?? 0;
  const threshold = conditionNode.data?.threshold ?? 0;
  if (type === 'engagement_less_than') return (payload.engagement ?? 0) < threshold;
  if (type === 'no_comments') return (payload.comments ?? 0) === 0;
  if (type === 'reach_below') return (payload.reach ?? 0) < threshold;
  return true;
}

/**
 * Run one action (async). In production, push to queue (Bull) and process in worker.
 */
async function runAction(actionNode, payload, context = {}) {
  const type = actionNode.data?.actionType || 'send_notification';
  const userId = context.userId || 'default';
  const actions = require('./actions');
  if (type === 'fetch_insights') return actions.fetchInsights(userId, payload);
  if (type === 'send_notification') return actions.sendNotification(payload);
  if (type === 'create_linkedin_post') return actions.createLinkedInPost(userId, payload);
  if (type === 'flag_content') return actions.flagContent(payload);
  return Promise.resolve();
}

/**
 * Process workflow JSON: find trigger node matching event, walk graph to conditions → action, run.
 * Simplified: single path trigger → condition → action (no full BFS; one path per trigger type).
 */
function findMatchingRule(workflow, eventType) {
  const triggerType = getTriggerTypeFromEvent(eventType);
  const nodes = workflow.nodes || [];
  const edges = workflow.edges || [];
  const triggerNode = nodes.find(
    (n) => n.type === 'trigger' && (n.data?.triggerType === triggerType || n.data?.triggerType === eventType)
  );
  if (!triggerNode) return null;
  const outEdges = edges.filter((e) => e.source === triggerNode.id);
  const nextId = outEdges[0]?.target;
  if (!nextId) return { triggerNode, conditionNode: null, actionNode: null, path: [triggerNode.id] };
  const nextNode = nodes.find((n) => n.id === nextId);
  const path = [triggerNode.id, nextId];
  if (nextNode?.type === 'condition') {
    const afterCond = edges.find((e) => e.source === nextNode.id)?.target;
    const actionNode = afterCond ? nodes.find((n) => n.id === afterCond) : null;
    if (actionNode) path.push(actionNode.id);
    return { triggerNode, conditionNode: nextNode, actionNode: actionNode || null, path };
  }
  if (nextNode?.type === 'action') {
    return { triggerNode, conditionNode: null, actionNode: nextNode, path };
  }
  if (nextNode?.type === 'delay') {
    const afterDelay = edges.find((e) => e.source === nextNode.id)?.target;
    const actionNode = afterDelay ? nodes.find((n) => n.id === afterDelay) : null;
    if (actionNode) path.push(actionNode.id);
    return { triggerNode, conditionNode: null, actionNode: actionNode || null, delayNode: nextNode, path };
  }
  return { triggerNode, conditionNode: null, actionNode: null, path };
}

/**
 * Register workflow and subscribe bus to event types that the workflow triggers on.
 */
function registerWorkflow(workflow) {
  const bus = getAutomationBus();
  const triggerTypes = (workflow.nodes || [])
    .filter((n) => n.type === 'trigger' && n.data?.triggerType)
    .map((n) => n.data.triggerType);
  const eventTypes = new Set();
  triggerTypes.forEach((t) => {
    eventTypes.add(t);
    if (t === 'new_comment') {
      eventTypes.add('meta:comment');
      eventTypes.add('meta:mention');
    }
    if (t === 'new_youtube_video') eventTypes.add('youtube:video_uploaded');
    if (t === 'post_published') eventTypes.add('post_published');
  });
  eventTypes.forEach((ev) => {
    bus.on(ev, (payload) => {
      const rule = findMatchingRule(workflow, ev);
      if (!rule || !rule.actionNode) return;
      if (rule.conditionNode && !evaluateCondition(rule.conditionNode, payload)) return;
      const delayHours = rule.delayNode?.data?.delayHours ?? 0;
      const run = () => runAction(rule.actionNode, payload).catch((e) => console.error('Action failed:', e));
      if (delayHours > 0) setTimeout(run, delayHours * 60 * 60 * 1000);
      else run();
    });
  });
  return () => {
    eventTypes.forEach((ev) => bus.removeAllListeners(ev));
  };
}

module.exports = {
  getAutomationBus,
  TRIGGER_TYPES,
  CONDITION_TYPES,
  ACTION_TYPES,
  getTriggerTypeFromEvent,
  evaluateCondition,
  runAction,
  findMatchingRule,
  registerWorkflow,
};
