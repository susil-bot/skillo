import type { NodeProps } from '@reactflow/core';
import { Handle, Position } from '@reactflow/core';
import type { TriggerNodeData, TriggerType } from '../types';

const TRIGGER_LABELS: Record<TriggerType, string> = {
  post_published: 'Post Published',
  new_comment: 'New Comment',
  new_youtube_video: 'New YouTube Video',
  new_like: 'New Like',
  new_subscriber: 'New Subscriber',
};

export function TriggerNode({ data, selected }: NodeProps<TriggerNodeData>) {
  const label = data.label ?? TRIGGER_LABELS[data.triggerType] ?? data.triggerType;

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[180px] shadow-sm
        bg-amber-50 dark:bg-amber-950/30
        border-amber-400 dark:border-amber-600
        ${selected ? 'ring-2 ring-amber-500' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-2 !bg-amber-500" />
      <div className="font-medium text-amber-900 dark:text-amber-100">Trigger</div>
      <div className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">{label}</div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-2 !bg-amber-500" />
    </div>
  );
}
