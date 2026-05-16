"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
} from "@liveblocks/react/suspense";
import { LiveMap, LiveObject, type JsonObject } from "@liveblocks/core";
import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
} from "@liveblocks/react";
import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow";
import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  MiniMap,
  ReactFlow,
  type EdgeTypes,
  type Connection,
  type DefaultEdgeOptions,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";

import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import {
  CanvasNodeRenderer,
  CanvasShapeSurface,
} from "@/components/editor/canvas-node";
import { ShapePanel } from "@/components/editor/shape-panel";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
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

const LIVEBLOCKS_FLOW_STORAGE_KEY = "flow";

type CanvasFlowStorage = NonNullable<Liveblocks["Storage"]["flow"]>;

interface CanvasWorkspaceProps {
  roomId: string;
  templateImportRequest?: TemplateImportRequest | null;
}

interface TemplateImportRequest {
  id: number;
  template: CanvasTemplate;
}

interface ShapeDragPreviewState {
  payload: ShapeDragPayload;
  position: {
    x: number;
    y: number;
  };
}

interface CanvasControlBarProps {
  canRedo: boolean;
  canUndo: boolean;
  onFitView: () => void;
  onRedo: () => void;
  onUndo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
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
  return (
    typeof value === "string" && NODE_SHAPES.includes(value as CanvasNodeShape)
  );
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

function createConnectionEdgeId(connection: Connection, edges: CanvasEdge[]) {
  const sourceHandle = connection.sourceHandle ?? "source";
  const targetHandle = connection.targetHandle ?? "target";
  const baseId = `edge-${connection.source}-${sourceHandle}-${connection.target}-${targetHandle}`;
  const existingIds = new Set(edges.map((edge) => edge.id));

  if (!existingIds.has(baseId)) {
    return baseId;
  }

  let suffix = 2;
  let nextId = `${baseId}-${suffix}`;

  while (existingIds.has(nextId)) {
    suffix += 1;
    nextId = `${baseId}-${suffix}`;
  }

  return nextId;
}

function createTemplateFlow(template: CanvasTemplate): CanvasFlowStorage {
  return new LiveObject({
    nodes: new LiveMap(
      template.nodes.map((node) => [
        node.id,
        LiveObject.from(node as unknown as JsonObject),
      ]),
    ),
    edges: new LiveMap(
      template.edges.map((edge) => [
        edge.id,
        LiveObject.from(edge as unknown as JsonObject),
      ]),
    ),
  }) as unknown as CanvasFlowStorage;
}

function CanvasControlBar({
  canRedo,
  canUndo,
  onFitView,
  onRedo,
  onUndo,
  onZoomIn,
  onZoomOut,
}: CanvasControlBarProps) {
  return (
    <div className="pointer-events-auto absolute bottom-20 left-5 z-10 flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-2xl shadow-background/50 backdrop-blur">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={onZoomOut}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Fit view"
          title="Fit view"
          onClick={onFitView}
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={onZoomIn}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
      </div>
      <div className="h-6 w-px bg-surface-border" />
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Undo"
          title="Undo"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <Undo2 className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Redo"
          title="Redo"
          disabled={!canRedo}
          onClick={onRedo}
        >
          <Redo2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function SyncedReactFlowCanvas({
  templateImportRequest,
}: {
  templateImportRequest?: TemplateImportRequest | null;
}) {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null);
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const [shapeDragPreview, setShapeDragPreview] =
    useState<ShapeDragPreviewState | null>(null);
  const previewFrameRef = useRef<number | null>(null);
  const queuedPreviewPositionRef = useRef<ShapeDragPreviewState["position"] | null>(
    null,
  );
  const importedTemplateRequestIdRef = useRef<number | null>(null);
  const nodeCounter = useRef(0);
  const isShapeDragging = shapeDragPreview !== null;
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      [CANVAS_NODE_TYPE]: CanvasNodeRenderer,
    }),
    [],
  );
  const edgeTypes = useMemo<EdgeTypes>(
    () => ({
      [CANVAS_EDGE_TYPE]: CanvasEdgeRenderer,
    }),
    [],
  );
  const defaultCanvasEdgeOptions = useMemo<DefaultEdgeOptions>(
    () => ({
      data: { label: "" },
      markerEnd: {
        color: "var(--text-primary)",
        height: 16,
        type: MarkerType.ArrowClosed,
        width: 16,
      },
      style: {
        stroke: "var(--text-primary)",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
      },
      type: CANVAS_EDGE_TYPE,
    }),
    [],
  );
  const {
    nodes,
    edges,
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
  const replaceCanvasWithTemplate = useMutation(
    ({ storage }, template: CanvasTemplate) => {
      storage.set(LIVEBLOCKS_FLOW_STORAGE_KEY, createTemplateFlow(template));
    },
    [],
  );

  const clearShapeDragPreview = useCallback(() => {
    if (previewFrameRef.current !== null) {
      window.cancelAnimationFrame(previewFrameRef.current);
      previewFrameRef.current = null;
    }

    queuedPreviewPositionRef.current = null;
    setShapeDragPreview(null);
  }, []);

  const scheduleShapePreviewPosition = useCallback(
    (position: ShapeDragPreviewState["position"]) => {
      queuedPreviewPositionRef.current = position;

      if (previewFrameRef.current !== null) {
        return;
      }

      previewFrameRef.current = window.requestAnimationFrame(() => {
        const nextPosition = queuedPreviewPositionRef.current;

        previewFrameRef.current = null;
        queuedPreviewPositionRef.current = null;

        if (!nextPosition) {
          return;
        }

        setShapeDragPreview((current) =>
          current
            ? {
                ...current,
                position: nextPosition,
              }
            : null,
        );
      });
    },
    [],
  );

  useEffect(() => {
    if (!isShapeDragging) {
      return;
    }

    function handleWindowDragOver(event: globalThis.DragEvent) {
      scheduleShapePreviewPosition({
        x: event.clientX,
        y: event.clientY,
      });
    }

    function handleWindowDragEnd() {
      clearShapeDragPreview();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        clearShapeDragPreview();
      }
    }

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragend", handleWindowDragEnd);
    window.addEventListener("drop", handleWindowDragEnd);
    window.addEventListener("blur", handleWindowDragEnd);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragend", handleWindowDragEnd);
      window.removeEventListener("drop", handleWindowDragEnd);
      window.removeEventListener("blur", handleWindowDragEnd);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearShapeDragPreview, isShapeDragging, scheduleShapePreviewPosition]);

  useEffect(() => clearShapeDragPreview, [clearShapeDragPreview]);

  useEffect(() => {
    if (
      !templateImportRequest ||
      importedTemplateRequestIdRef.current === templateImportRequest.id
    ) {
      return;
    }

    importedTemplateRequestIdRef.current = templateImportRequest.id;
    replaceCanvasWithTemplate(templateImportRequest.template);

    window.requestAnimationFrame(() => {
      void reactFlowInstance?.fitView({ duration: 180, padding: 0.25 });
    });
  }, [
    reactFlowInstance,
    replaceCanvasWithTemplate,
    templateImportRequest,
  ]);

  const handleShapeDragStart = useCallback(
    (payload: ShapeDragPayload, position: { x: number; y: number }) => {
      setShapeDragPreview({ payload, position });
    },
    [],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes(SHAPE_DRAG_MIME_TYPE)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      clearShapeDragPreview();

      const payload = parseShapeDragPayload(event.dataTransfer);

      if (!payload || !reactFlowInstance) {
        return;
      }

      nodeCounter.current += 1;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - payload.width / 2,
        y: event.clientY - payload.height / 2,
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
    [clearShapeDragPreview, onNodesChange, reactFlowInstance],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      const edge: CanvasEdge = {
        data: { label: "" },
        id: createConnectionEdgeId(connection, edges),
        markerEnd: defaultCanvasEdgeOptions.markerEnd,
        source: connection.source,
        sourceHandle: connection.sourceHandle,
        style: defaultCanvasEdgeOptions.style,
        target: connection.target,
        targetHandle: connection.targetHandle,
        type: CANVAS_EDGE_TYPE,
      };

      onEdgesChange([{ type: "add", item: edge }]);
    },
    [defaultCanvasEdgeOptions, edges, onEdgesChange],
  );

  const handleZoomIn = useCallback(() => {
    void reactFlowInstance?.zoomIn({ duration: 180 });
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    void reactFlowInstance?.zoomOut({ duration: 180 });
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    void reactFlowInstance?.fitView({ duration: 180, padding: 0.25 });
  }, [reactFlowInstance]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      history.undo();
    }
  }, [canUndo, history]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      history.redo();
    }
  }, [canRedo, history]);

  useKeyboardShortcuts({
    reactFlowInstance,
    onRedo: handleRedo,
    onUndo: handleUndo,
  });

  return (
    <div
      className="relative h-full w-full bg-base"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <ReactFlow<CanvasNode, CanvasEdge>
        className="h-full w-full bg-base"
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        nodeTypes={nodeTypes}
        onConnect={handleConnect}
        onDelete={onDelete}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onInit={setReactFlowInstance}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={defaultCanvasEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2}
        panOnScroll
        selectionOnDrag
        proOptions={{ hideAttribution: true }}
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
        <Cursors />
      </ReactFlow>
      {shapeDragPreview ? (
        <div className="pointer-events-none fixed inset-0 z-50 opacity-70">
          <div
            style={{
              height: shapeDragPreview.payload.height,
              transform: `translate3d(${
                shapeDragPreview.position.x -
                shapeDragPreview.payload.width / 2
              }px, ${
                shapeDragPreview.position.y -
                shapeDragPreview.payload.height / 2
              }px, 0)`,
              width: shapeDragPreview.payload.width,
            }}
          >
            <CanvasShapeSurface
              label=""
              selected
              fill={DEFAULT_NODE_COLOR.fill}
              text={DEFAULT_NODE_COLOR.text}
              shape={shapeDragPreview.payload.shape}
            />
          </div>
        </div>
      ) : null}
      <CanvasControlBar
        canRedo={canRedo}
        canUndo={canUndo}
        onFitView={handleFitView}
        onRedo={handleRedo}
        onUndo={handleUndo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      <ShapePanel
        onShapeDragStart={handleShapeDragStart}
        onShapeDragEnd={clearShapeDragPreview}
      />
    </div>
  );
}

export function CanvasWorkspace({
  roomId,
  templateImportRequest,
}: CanvasWorkspaceProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <LiveblocksRoomErrorBoundary>
          <ClientSideSuspense fallback={<CanvasLoadingState />}>
            {() => (
              <SyncedReactFlowCanvas
                templateImportRequest={templateImportRequest}
              />
            )}
          </ClientSideSuspense>
        </LiveblocksRoomErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
