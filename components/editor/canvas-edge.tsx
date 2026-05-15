"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const EDGE_LABEL_HINT = "Label";
const EDGE_LABEL_MIN_CHARS = 5;
const EDGE_LABEL_MAX_CHARS = 28;

function stopLabelInteraction(event: SyntheticEvent) {
  event.stopPropagation();
}

export function CanvasEdgeRenderer({
  data,
  id,
  markerEnd,
  selected,
  sourcePosition,
  sourceX,
  sourceY,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps<CanvasEdge>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const label = data?.label ?? "";
  const [draftLabel, setDraftLabel] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const isActive = selected || isHovered || isEditing;
  const hasLabel = label.trim().length > 0;
  const shouldShowLabel = hasLabel || isActive;
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY,
    borderRadius: 0,
  });

  const saveLabel = useCallback(
    (nextLabel: string) => {
      updateEdgeData(id, { label: nextLabel.trim() });
    },
    [id, updateEdgeData],
  );

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  function beginEditing() {
    setDraftLabel(label);
    setIsEditing(true);
  }

  function closeEditing() {
    saveLabel(draftLabel);
    setIsEditing(false);
  }

  function handleDraftChange(event: ChangeEvent<HTMLInputElement>) {
    setDraftLabel(event.target.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    event.stopPropagation();

    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      closeEditing();
    }
  }

  const labelWidth = `${Math.min(
    Math.max(draftLabel.length + 1, EDGE_LABEL_MIN_CHARS),
    EDGE_LABEL_MAX_CHARS,
  )}ch`;

  return (
    <>
      <g
        onDoubleClick={(event) => {
          event.stopPropagation();
          beginEditing();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeLinecap="round"
          strokeWidth={24}
          className="react-flow__edge-interaction"
        />
        <path
          d={edgePath}
          fill="none"
          markerEnd={markerEnd}
          stroke="var(--text-primary)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          className="transition-opacity"
          opacity={isActive ? 0.95 : 0.5}
        />
      </g>

      {shouldShowLabel ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan nowheel pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            onClick={stopLabelInteraction}
            onDoubleClick={(event) => {
              event.stopPropagation();
              beginEditing();
            }}
            onMouseDown={stopLabelInteraction}
            onPointerDown={stopLabelInteraction}
            onTouchStart={stopLabelInteraction}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                aria-label="Edge label"
                className="rounded-full border border-surface-border bg-surface/95 px-2.5 py-1 text-center text-xs font-medium text-copy-primary shadow-lg shadow-background/30 outline-none placeholder:text-copy-faint focus:border-brand"
                value={draftLabel}
                placeholder={EDGE_LABEL_HINT}
                style={{ width: labelWidth }}
                onBlur={closeEditing}
                onChange={handleDraftChange}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <button
                type="button"
                className={`rounded-full border px-2.5 py-1 text-xs font-medium shadow-lg shadow-background/30 transition-colors ${
                  hasLabel
                    ? "border-surface-border bg-surface/95 text-copy-secondary"
                    : "border-surface-border/70 bg-surface/70 text-copy-faint"
                }`}
                onClick={stopLabelInteraction}
              >
                {hasLabel ? label : EDGE_LABEL_HINT}
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
