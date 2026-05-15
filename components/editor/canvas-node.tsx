"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { DEFAULT_NODE_SHAPE } from "@/types/canvas";

const MIN_NODE_HEIGHT = 56;
const MIN_NODE_WIDTH = 80;
const EMPTY_LABEL_PLACEHOLDER = "Label";

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

interface EditableNodeLabelProps {
  label: string;
  nodeId: string;
  text: string;
}

function EditableNodeLabel({ label, nodeId, text }: EditableNodeLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const textarea = textareaRef.current;

    textarea?.focus();
    textarea?.select();
  }, [isEditing]);

  const updateLabel = useCallback(
    (nextLabel: string) => {
      updateNodeData(nodeId, { label: nextLabel });
    },
    [nodeId, updateNodeData],
  );

  function stopTextInteraction(event: SyntheticEvent) {
    event.stopPropagation();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    event.stopPropagation();

    if (event.key === "Escape") {
      event.preventDefault();
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        aria-label="Node label"
        className="nodrag nopan nowheel absolute left-1/2 top-1/2 h-12 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 resize-none overflow-hidden border-0 bg-transparent px-3 py-3 text-center text-sm font-medium leading-5 outline-none placeholder:text-copy-muted"
        placeholder={EMPTY_LABEL_PLACEHOLDER}
        value={label}
        style={{ color: text }}
        onBlur={() => setIsEditing(false)}
        onChange={(event) => updateLabel(event.target.value)}
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
    <button
      type="button"
      className="nodrag nopan absolute inset-0 flex h-full w-full items-center justify-center border-0 bg-transparent p-0 text-sm font-medium"
      onDoubleClick={(event) => {
        event.stopPropagation();
        setIsEditing(true);
      }}
    >
      <NodeLabel label={label} />
    </button>
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

  return (
    <div className="group relative h-full w-full">
      <NodeResizer
        isVisible={selected}
        minHeight={MIN_NODE_HEIGHT}
        minWidth={MIN_NODE_WIDTH}
        color={text}
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
