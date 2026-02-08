import type { NodeProps } from '@reactflow/core';
import { Handle, Position } from '@reactflow/core';
import type { ActionNodeData, ActionType } from '../types';

const ACTION_LABELS: Record<ActionType, string> = {
  fetch_insights: 'Fetch insights',
  send_notification: 'Send notification',
  create_linkedin_post: 'Create LinkedIn post',
  flag_content: 'Flag content',
};

export function ActionNode({ data, selected }: NodeProps<ActionNodeData>) {
  const label = data.label ?? ACTION_LABELS[data.actionType] ?? data.actionType;

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[180px] shadow-sm
        bg-emerald-50 dark:bg-emerald-950/30
        border-emerald-400 dark:border-emerald-600
        ${selected ? 'ring-2 ring-emerald-500' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-2 !bg-emerald-500" />
      <div className="font-medium text-emerald-900 dark:text-emerald-100">Action</div>
      <div className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">{label}</div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-2 !bg-emerald-500" />
    </div>
  );
}
