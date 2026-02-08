import type { NodeProps } from '@reactflow/core';
import { Handle, Position } from '@reactflow/core';
import type { ConditionNodeData, ConditionType } from '../types';

const CONDITION_LABELS: Record<ConditionType, string> = {
  engagement_less_than: 'Engagement < X',
  no_comments: 'No comments',
  reach_below: 'Reach below threshold',
  always: 'Always',
};

export function ConditionNode({ data, selected }: NodeProps<ConditionNodeData>) {
  const label = data.label ?? CONDITION_LABELS[data.conditionType] ?? data.conditionType;
  const threshold = data.threshold != null ? String(data.threshold) : '—';

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[180px] shadow-sm
        bg-blue-50 dark:bg-blue-950/30
        border-blue-400 dark:border-blue-600
        ${selected ? 'ring-2 ring-blue-500' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-2 !bg-blue-500" />
      <div className="font-medium text-blue-900 dark:text-blue-100">Condition</div>
      <div className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">{label}</div>
      {data.conditionType !== 'always' && (
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Threshold: {threshold}</div>
      )}
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-2 !bg-blue-500" />
    </div>
  );
}
