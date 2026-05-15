"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";

import type { CanvasEdge, CanvasNode, CanvasNodeColor } from "@/types/canvas";
import { DEFAULT_NODE_SHAPE, NODE_COLORS } from "@/types/canvas";

const MIN_NODE_HEIGHT = 56;
const MIN_NODE_WIDTH = 80;
const EMPTY_LABEL_PLACEHOLDER = "Label";
const LABEL_UPDATE_DELAY_MS = 200;

interface NodeSurfaceProps {
  children?: ReactNode;
  selected: boolean;
  fill: string;
  text: string;
  shapeClassName?: string;
}

interface CanvasShapeSurfaceProps {
  label: string;
  selected: boolean;
  fill: string;
  text: string;
  shape: CanvasNode["data"]["shape"];
  children?: ReactNode;
}

function NodeLabel({ label }: { label: string }) {
  const displayLabel = label || EMPTY_LABEL_PLACEHOLDER;

  return (
    <span
      className={`block max-w-full truncate px-4 text-center leading-5 ${
        label ? "" : "text-copy-muted"
      }`}
    >
      {displayLabel}
    </span>
  );
}

function NodeHandles() {
  const handleClassName =
    "h-2.5 w-2.5 border border-background bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100";

  return (
    <>
      <Handle
        type="source"
        position={Position.Top}
        className={handleClassName}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={handleClassName}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={handleClassName}
      />
      <Handle
        type="source"
        position={Position.Left}
        className={handleClassName}
      />
    </>
  );
}

function BasicNodeSurface({
  children,
  selected,
  fill,
  text,
  shapeClassName = "rounded-xl",
}: NodeSurfaceProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center border px-4 py-3 text-center text-sm font-medium shadow-lg shadow-background/20 ${shapeClassName}`}
      style={{
        backgroundColor: fill,
        borderColor: selected ? text : "var(--border-subtle)",
        color: text,
      }}
    >
      {children}
    </div>
  );
}

function SvgNodeSurface({
  children,
  selected,
  fill,
  text,
  shape,
}: NodeSurfaceProps & { shape: "diamond" | "cylinder" | "hexagon" }) {
  const stroke = selected ? text : "var(--border-subtle)";

  return (
    <div
      className="relative h-full w-full text-sm font-medium shadow-lg shadow-background/20"
      style={{ color: text }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {shape === "diamond" ? (
          <polygon
            points="50 2, 98 50, 50 98, 2 50"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ) : null}

        {shape === "hexagon" ? (
          <polygon
            points="25 4, 75 4, 98 50, 75 96, 25 96, 2 50"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        ) : null}

        {shape === "cylinder" ? (
          <>
            <path
              d="M8 18 C8 8 92 8 92 18 L92 82 C92 92 8 92 8 82 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <ellipse
              cx="50"
              cy="18"
              rx="42"
              ry="12"
              fill={fill}
              stroke={stroke}
              strokeWidth="2"
            />
            <path
              d="M8 82 C8 72 92 72 92 82"
              fill="none"
              stroke={stroke}
              strokeWidth="2"
            />
          </>
        ) : null}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center px-5 py-4 text-center">
        {children}
      </div>
    </div>
  );
}

function getSafeCssColor(value: string) {
  if (typeof CSS !== "undefined" && CSS.supports("color", value)) {
    return value;
  }

  return "var(--border-subtle)";
}

interface EditableNodeLabelProps {
  label: string;
  nodeId: string;
  text: string;
}

interface NodeColorToolbarProps {
  activeColor: CanvasNodeColor;
  nodeId: string;
  selected: boolean;
}

function isSameNodeColor(color: CanvasNodeColor, candidate: CanvasNodeColor) {
  return color.fill === candidate.fill && color.text === candidate.text;
}

function NodeColorToolbar({
  activeColor,
  nodeId,
  selected,
}: NodeColorToolbarProps) {
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();

  function stopToolbarInteraction(event: SyntheticEvent) {
    event.stopPropagation();
  }

  function selectColor(color: CanvasNodeColor) {
    updateNodeData(nodeId, { color });
  }

  return (
    <NodeToolbar
      nodeId={nodeId}
      isVisible={selected}
      position={Position.Top}
      offset={14}
      className="nodrag nopan nowheel"
    >
      <div
        className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-2xl shadow-background/40 backdrop-blur"
        onClick={stopToolbarInteraction}
        onDoubleClick={stopToolbarInteraction}
        onMouseDown={stopToolbarInteraction}
        onPointerDown={stopToolbarInteraction}
        onTouchStart={stopToolbarInteraction}
      >
        {NODE_COLORS.map((color) => {
          const isActive = isSameNodeColor(activeColor, color);

          return (
            <button
              key={`${color.fill}-${color.text}`}
              type="button"
              aria-label="Change node color"
              aria-pressed={isActive}
              className="h-5 w-5 rounded-full border transition-[border-color,box-shadow,transform] hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              style={{
                backgroundColor: color.fill,
                borderColor: isActive ? color.text : "var(--border-subtle)",
                boxShadow: isActive
                  ? `0 0 0 2px ${color.text}`
                  : `0 0 0 0 ${color.text}`,
              }}
              onClick={() => selectColor(color)}
              onMouseEnter={(event) => {
                event.currentTarget.style.boxShadow = `0 0 0 2px ${color.text}`;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.boxShadow = isActive
                  ? `0 0 0 2px ${color.text}`
                  : `0 0 0 0 ${color.text}`;
              }}
            >
              <span
                className="block h-full w-full rounded-full border"
                style={{ borderColor: color.text }}
              />
            </button>
          );
        })}
      </div>
    </NodeToolbar>
  );
}

function EditableNodeLabel({ label, nodeId, text }: EditableNodeLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const labelUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();

  const commitLabel = useCallback(
    (nextLabel: string) => {
      updateNodeData(nodeId, { label: nextLabel });
    },
    [nodeId, updateNodeData],
  );

  const clearPendingLabelUpdate = useCallback(() => {
    if (labelUpdateTimeoutRef.current) {
      clearTimeout(labelUpdateTimeoutRef.current);
      labelUpdateTimeoutRef.current = null;
    }
  }, []);

  const flushLabelUpdate = useCallback(
    (nextLabel: string) => {
      clearPendingLabelUpdate();
      commitLabel(nextLabel);
    },
    [clearPendingLabelUpdate, commitLabel],
  );

  const scheduleLabelUpdate = useCallback(
    (nextLabel: string) => {
      clearPendingLabelUpdate();
      labelUpdateTimeoutRef.current = setTimeout(() => {
        labelUpdateTimeoutRef.current = null;
        commitLabel(nextLabel);
      }, LABEL_UPDATE_DELAY_MS);
    },
    [clearPendingLabelUpdate, commitLabel],
  );

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const textarea = textareaRef.current;

    textarea?.focus();
    textarea?.select();
  }, [isEditing]);

  useEffect(() => clearPendingLabelUpdate, [clearPendingLabelUpdate]);

  function stopTextInteraction(event: SyntheticEvent) {
    event.stopPropagation();
  }

  function handleLabelChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextLabel = event.target.value;

    setDraftLabel(nextLabel);
    scheduleLabelUpdate(nextLabel);
  }

  function closeEditing() {
    flushLabelUpdate(draftLabel);
    setIsEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    event.stopPropagation();

    if (event.key === "Escape") {
      event.preventDefault();
      closeEditing();
    }
  }

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        aria-label="Node label"
        className="nodrag nopan nowheel absolute left-1/2 top-1/2 h-12 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 resize-none overflow-hidden border-0 bg-transparent px-3 py-3 text-center text-sm font-medium leading-5 outline-none placeholder:text-copy-muted"
        placeholder={EMPTY_LABEL_PLACEHOLDER}
        value={draftLabel}
        style={{ color: text }}
        onBlur={closeEditing}
        onChange={handleLabelChange}
        onClick={stopTextInteraction}
        onDoubleClick={stopTextInteraction}
        onKeyDown={handleKeyDown}
        onMouseDown={stopTextInteraction}
        onPointerDown={stopTextInteraction}
        onTouchStart={stopTextInteraction}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 flex h-full w-full items-center justify-center text-sm font-medium"
      onDoubleClick={(event) => {
        event.stopPropagation();
        setDraftLabel(label);
        setIsEditing(true);
      }}
    >
      <NodeLabel label={label} />
    </div>
  );
}

export function CanvasNodeRenderer({
  data,
  id,
  selected,
}: NodeProps<CanvasNode>) {
  const shape = data.shape ?? DEFAULT_NODE_SHAPE;
  const label = data.label || "";
  const fill = data.color.fill;
  const text = data.color.text;
  const resizerColor = getSafeCssColor(text);

  return (
    <div className="group relative h-full w-full">
      <NodeColorToolbar
        activeColor={data.color}
        nodeId={id}
        selected={selected}
      />
      <NodeResizer
        isVisible={selected}
        minHeight={MIN_NODE_HEIGHT}
        minWidth={MIN_NODE_WIDTH}
        color={resizerColor}
        lineClassName="opacity-40"
        handleClassName="h-2.5 w-2.5 border border-background bg-copy-primary opacity-80"
      />
      <CanvasShapeSurface
        label={label}
        selected={selected}
        fill={fill}
        text={text}
        shape={shape}
      >
        <EditableNodeLabel label={label} nodeId={id} text={text} />
      </CanvasShapeSurface>
      <NodeHandles />
    </div>
  );
}

export function CanvasShapeSurface({
  label,
  selected,
  fill,
  text,
  shape,
  children,
}: CanvasShapeSurfaceProps) {
  const content = children ?? <NodeLabel label={label} />;

  return (
    <>
      {shape === "rectangle" ? (
        <BasicNodeSurface selected={selected} fill={fill} text={text}>
          {content}
        </BasicNodeSurface>
      ) : null}

      {shape === "circle" ? (
        <BasicNodeSurface
          selected={selected}
          fill={fill}
          text={text}
          shapeClassName="rounded-full"
        >
          {content}
        </BasicNodeSurface>
      ) : null}

      {shape === "pill" ? (
        <BasicNodeSurface
          selected={selected}
          fill={fill}
          text={text}
          shapeClassName="rounded-full"
        >
          {content}
        </BasicNodeSurface>
      ) : null}

      {shape === "diamond" || shape === "cylinder" || shape === "hexagon" ? (
        <SvgNodeSurface
          selected={selected}
          fill={fill}
          text={text}
          shape={shape}
        >
          {content}
        </SvgNodeSurface>
      ) : null}
    </>
  );
}
