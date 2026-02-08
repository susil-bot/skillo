import React from 'react';
import type { Node } from '@reactflow/core';
import type { TriggerNodeData, ConditionNodeData, ActionNodeData, DelayNodeData } from '../types';
import { TRIGGER_OPTIONS, CONDITION_OPTIONS, ACTION_OPTIONS } from '../constants';

interface InspectorPanelProps {
  node: Node | null;
  onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
}

export function InspectorPanel({ node, onUpdate }: InspectorPanelProps) {
  if (!node) {
    return (
      <div className="p-4 text-muted-foreground text-sm">
        Select a node to edit its configuration.
      </div>
    );
  }

  const data = node.data as Record<string, unknown>;

  const handleChange = (key: string, value: unknown) => {
    onUpdate(node.id, { ...data, [key]: value });
  };

  if (node.type === 'trigger') {
    const d = data as TriggerNodeData;
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-amber-700 dark:text-amber-400">Trigger</h3>
        <label className="block text-sm font-medium">
          Event
          <select
            value={d.triggerType ?? ''}
            onChange={(e) => handleChange('triggerType', e.target.value)}
            className="mt-1 block w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
          >
            {TRIGGER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  if (node.type === 'condition') {
    const d = data as ConditionNodeData;
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-blue-700 dark:text-blue-400">Condition</h3>
        <label className="block text-sm font-medium">
          Type
          <select
            value={d.conditionType ?? 'always'}
            onChange={(e) => handleChange('conditionType', e.target.value)}
            className="mt-1 block w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
          >
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        {d.conditionType !== 'always' && (
          <label className="block text-sm font-medium">
            Threshold
            <input
              type="number"
              value={d.threshold ?? ''}
              onChange={(e) => handleChange('threshold', e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 block w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
              min={0}
            />
          </label>
        )}
      </div>
    );
  }

  if (node.type === 'action') {
    const d = data as ActionNodeData;
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Action</h3>
        <label className="block text-sm font-medium">
          Action
          <select
            value={d.actionType ?? ''}
            onChange={(e) => handleChange('actionType', e.target.value)}
            className="mt-1 block w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  if (node.type === 'delay') {
    const d = data as DelayNodeData;
    return (
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-violet-700 dark:text-violet-400">Delay</h3>
        <label className="block text-sm font-medium">
          Hours
          <input
            type="number"
            value={d.delayHours ?? 0}
            onChange={(e) => handleChange('delayHours', Number(e.target.value) || 0)}
            className="mt-1 block w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
            min={0}
            max={720}
          />
        </label>
      </div>
    );
  }

  return (
    <div className="p-4 text-muted-foreground text-sm">
      No config for this node type.
    </div>
  );
}
