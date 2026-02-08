import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
} from '@reactflow/core';
import { Background } from '@reactflow/background';
import { Controls } from '@reactflow/controls';
import { MiniMap } from '@reactflow/minimap';
import '@reactflow/core/dist/style.css';
import '@reactflow/core/dist/base.css';

import { TriggerNode, ConditionNode, ActionNode, DelayNode } from './nodes';
import { Sidebar } from './components/Sidebar';
import { InspectorPanel } from './components/InspectorPanel';
import { sampleWorkflow } from './sampleWorkflow';
import type { WorkflowJSON } from './types';

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  delay: DelayNode,
};

const initialNodes: Node[] = sampleWorkflow.nodes as Node[];
const initialEdges: Edge[] = sampleWorkflow.edges as Edge[];

function FlowCanvas({
  onSave,
  onLoad,
  selectedNode,
  onSelectNode,
  onUpdateNode,
}: {
  onSave: (json: WorkflowJSON) => void;
  onLoad: (json: WorkflowJSON) => void;
  selectedNode: Node | null;
  onSelectNode: (n: Node | null) => void;
  onUpdateNode: (id: string, data: Record<string, unknown>) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData('application/reactflow');
      if (!raw) return;
      const { kind, data } = JSON.parse(raw) as {
        kind: 'trigger' | 'condition' | 'action' | 'delay';
        data: Record<string, unknown>;
      };
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = `${kind}-${Date.now()}`;
      const newNode: Node = {
        id,
        type: kind,
        position,
        data: { ...data },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes: selected }: { nodes: Node[] }) => {
      onSelectNode(selected.length === 1 ? selected[0] ?? null : null);
    },
    [onSelectNode]
  );

  const handleUpdateNode = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
      );
      onUpdateNode(nodeId, data);
    },
    [setNodes, onUpdateNode]
  );

  const handleSave = useCallback(() => {
    const json: WorkflowJSON = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as 'trigger' | 'condition' | 'action' | 'delay',
        position: n.position,
        data: n.data,
      })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
    };
    onSave(json);
    try {
      navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    } catch {
      // ignore
    }
  }, [nodes, edges, onSave]);

  const handleLoad = useCallback(() => {
    const raw = window.prompt('Paste workflow JSON (nodes + edges):');
    if (!raw) return;
    try {
      const json = JSON.parse(raw) as WorkflowJSON;
      if (Array.isArray(json.nodes) && Array.isArray(json.edges)) {
        setNodes(json.nodes as Node[]);
        setEdges(json.edges as Edge[]);
        onLoad(json);
        onSelectNode(null);
      }
    } catch {
      window.alert('Invalid JSON');
    }
  }, [setNodes, setEdges, onLoad, onSelectNode]);

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex border-b border-border px-4 py-2 gap-2 items-center bg-muted/20">
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          title="Saves workflow and copies JSON to clipboard"
        >
          Save workflow (copy JSON)
        </button>
        <button
          type="button"
          onClick={handleLoad}
          className="px-3 py-1.5 rounded-md border border-input bg-background text-sm font-medium"
        >
          Load workflow
        </button>
        <span className="text-muted-foreground text-sm ml-2">
          Export/import JSON for the backend automation engine.
        </span>
      </div>
      <div className="flex flex-1 min-h-0">
        <Sidebar onDragStart={() => {}} />
        <div className="flex-1 flex min-w-0">
          <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              fitView
              className="bg-muted/10"
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
          <div className="w-64 shrink-0 border-l border-border bg-background overflow-auto">
            <div className="border-b border-border px-3 py-2 text-sm font-medium text-muted-foreground">
              Node config
            </div>
            <InspectorPanel
              node={selectedNode}
              onUpdate={handleUpdateNode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AutomationWorkflow() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [lastSaved, setLastSaved] = useState<WorkflowJSON | null>(null);

  const Wrapped = () => (
    <FlowCanvas
      onSave={(json) => setLastSaved(json)}
      onLoad={() => {}}
      selectedNode={selectedNode}
      onSelectNode={setSelectedNode}
      onUpdateNode={() => {}}
    />
  );

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px] flex flex-col">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold">Automation workflows</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Build trigger → condition → action flows. Save as JSON for the backend engine.
        </p>
      </div>
      <div className="flex-1 min-h-0 px-6 pb-6">
        <ReactFlowProvider>
          <Wrapped />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
