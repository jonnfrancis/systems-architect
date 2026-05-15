"use client";

import { useCallback, useMemo, useRef, useState, type DragEvent } from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
} from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";

import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  SHAPE_DRAG_MIME_TYPE,
  type CanvasNodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";

interface CanvasWorkspaceProps {
  roomId: string;
}

function CanvasLoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base text-sm text-copy-muted">
      Loading canvas...
    </div>
  );
}

function LiveblocksErrorFallback({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base px-6 text-center">
      <div className="rounded-2xl border border-state-error/40 bg-subtle px-5 py-4">
        <p className="text-sm font-medium text-copy-primary">
          Canvas connection failed
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-copy-muted">
          {message}
        </p>
      </div>
    </div>
  );
}

function LiveblocksRoomErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useErrorListener((error) => {
    setErrorMessage(error.message || "Unable to connect to the canvas room.");
  });

  if (errorMessage) {
    return <LiveblocksErrorFallback message={errorMessage} />;
  }

  return children;
}

function isCanvasNodeShape(value: unknown): value is CanvasNodeShape {
  return typeof value === "string" && NODE_SHAPES.includes(value as CanvasNodeShape);
}

function parseShapeDragPayload(dataTransfer: DataTransfer) {
  const payload = dataTransfer.getData(SHAPE_DRAG_MIME_TYPE);

  if (!payload) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(payload);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "shape" in parsed &&
      "width" in parsed &&
      "height" in parsed &&
      isCanvasNodeShape(parsed.shape) &&
      typeof parsed.width === "number" &&
      Number.isFinite(parsed.width) &&
      typeof parsed.height === "number" &&
      Number.isFinite(parsed.height)
    ) {
      return parsed as ShapeDragPayload;
    }
  } catch {
    return null;
  }

  return null;
}

function SyncedReactFlowCanvas() {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null);
  const nodeCounter = useRef(0);
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      [CANVAS_NODE_TYPE]: CanvasNodeRenderer,
    }),
    [],
  );
  const {
    nodes,
    edges,
    onConnect,
    onDelete,
    onEdgesChange,
    onNodesChange,
  } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
    nodes: {
      initial: [],
    },
    edges: {
      initial: [],
    },
  });

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes(SHAPE_DRAG_MIME_TYPE)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const payload = parseShapeDragPayload(event.dataTransfer);

      if (!payload || !reactFlowInstance) {
        return;
      }

      nodeCounter.current += 1;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const nodeId = `${payload.shape}-${Date.now()}-${nodeCounter.current}`;
      const node: CanvasNode = {
        id: nodeId,
        type: CANVAS_NODE_TYPE,
        position,
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          shape: payload.shape,
        },
        style: {
          width: payload.width,
          height: payload.height,
        },
      };

      onNodesChange([{ type: "add", item: node }]);
    },
    [onNodesChange, reactFlowInstance],
  );

  return (
    <div className="relative h-full w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow<CanvasNode, CanvasEdge>
        className="bg-base"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onDelete={onDelete}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onInit={setReactFlowInstance}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{ type: CANVAS_EDGE_TYPE }}
        fitView
        colorMode="dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="var(--border-subtle)"
        />
        <MiniMap
          pannable
          zoomable
          nodeColor="var(--bg-subtle)"
          maskColor="color-mix(in srgb, var(--bg-base) 72%, transparent)"
        />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

export function CanvasWorkspace({ roomId }: CanvasWorkspaceProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <LiveblocksRoomErrorBoundary>
          <ClientSideSuspense fallback={<CanvasLoadingState />}>
            {() => <SyncedReactFlowCanvas />}
          </ClientSideSuspense>
        </LiveblocksRoomErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
