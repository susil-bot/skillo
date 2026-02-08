import type { NodeProps } from '@reactflow/core';
import { Handle, Position } from '@reactflow/core';
import type { DelayNodeData } from '../types';

export function DelayNode({ data, selected }: NodeProps<DelayNodeData>) {
  const hours = data.delayHours ?? 0;

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 min-w-[180px] shadow-sm
        bg-violet-50 dark:bg-violet-950/30
        border-violet-400 dark:border-violet-600
        ${selected ? 'ring-2 ring-violet-500' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !border-2 !bg-violet-500" />
      <div className="font-medium text-violet-900 dark:text-violet-100">Delay</div>
      <div className="text-sm text-violet-700 dark:text-violet-300 mt-0.5">Wait {hours} hour(s)</div>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !border-2 !bg-violet-500" />
    </div>
  );
}
