import React from 'react';
import type { TriggerType, ConditionType, ActionType } from '../types';
import { TRIGGER_OPTIONS, CONDITION_OPTIONS, ACTION_OPTIONS } from '../constants';

type NodeKind = 'trigger' | 'condition' | 'action' | 'delay';

interface SidebarProps {
  onDragStart: (e: React.DragEvent, kind: NodeKind, data: Record<string, unknown>) => void;
}

function DraggableItem({
  label,
  kind,
  data,
  onDragStart,
  colorClass,
}: {
  label: string;
  kind: NodeKind;
  data: Record<string, unknown>;
  onDragStart: (e: React.DragEvent, k: NodeKind, d: Record<string, unknown>) => void;
  colorClass: string;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/reactflow', JSON.stringify({ kind, data }));
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(e, kind, data);
      }}
      className={`px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing text-sm font-medium ${colorClass}`}
    >
      {label}
    </div>
  );
}

export function Sidebar({ onDragStart }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-muted/30 p-4 flex flex-col gap-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Triggers
        </h3>
        <div className="space-y-2">
          {TRIGGER_OPTIONS.map((opt) => (
            <DraggableItem
              key={opt.value}
              label={opt.label}
              kind="trigger"
              data={{ triggerType: opt.value }}
              onDragStart={onDragStart}
              colorClass="bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100"
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Conditions
        </h3>
        <div className="space-y-2">
          {CONDITION_OPTIONS.map((opt) => (
            <DraggableItem
              key={opt.value}
              label={opt.label}
              kind="condition"
              data={{ conditionType: opt.value }}
              onDragStart={onDragStart}
              colorClass="bg-blue-100 dark:bg-blue-900/40 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100"
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Actions
        </h3>
        <div className="space-y-2">
          {ACTION_OPTIONS.map((opt) => (
            <DraggableItem
              key={opt.value}
              label={opt.label}
              kind="action"
              data={{ actionType: opt.value }}
              onDragStart={onDragStart}
              colorClass="bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100"
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Delay
        </h3>
        <DraggableItem
          label="Wait X hours"
          kind="delay"
          data={{ delayHours: 1 }}
          onDragStart={onDragStart}
          colorClass="bg-violet-100 dark:bg-violet-900/40 border-violet-300 dark:border-violet-700 text-violet-900 dark:text-violet-100"
        />
      </div>
    </aside>
  );
}
