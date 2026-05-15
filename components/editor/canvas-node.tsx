"use client";

import type { NodeProps } from "@xyflow/react";

import type { CanvasNode } from "@/types/canvas";

export function CanvasNodeRenderer({ data, selected }: NodeProps<CanvasNode>) {
  return (
    <div
      className="flex h-full min-h-16 w-full min-w-28 items-center justify-center rounded-xl border bg-subtle px-4 py-3 text-center text-sm font-medium shadow-lg shadow-background/20"
      style={{
        backgroundColor: data.color.fill,
        borderColor: selected ? data.color.text : "var(--border-subtle)",
        color: data.color.text,
      }}
    >
      <span className="truncate">{data.label}</span>
    </div>
  );
}
