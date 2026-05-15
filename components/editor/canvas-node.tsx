"use client";

import type { ReactNode } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import type { CanvasNode } from "@/types/canvas";
import { DEFAULT_NODE_SHAPE } from "@/types/canvas";

interface NodeSurfaceProps {
  children?: ReactNode;
  selected: boolean;
  fill: string;
  text: string;
  shapeClassName?: string;
}

function NodeLabel({ label }: { label: string }) {
  return (
    <span className="block max-w-full truncate px-4 text-center leading-5">
      {label}
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

export function CanvasNodeRenderer({ data, selected }: NodeProps<CanvasNode>) {
  const shape = data.shape ?? DEFAULT_NODE_SHAPE;
  const label = data.label || "";
  const fill = data.color.fill;
  const text = data.color.text;
  const content = <NodeLabel label={label} />;

  return (
    <div className="group h-full w-full">
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

      <NodeHandles />
    </div>
  );
}
