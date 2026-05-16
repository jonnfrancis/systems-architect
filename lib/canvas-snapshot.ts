import type { CSSProperties } from "react";

import type { CanvasEdge, CanvasNode, CanvasSnapshot } from "@/types/canvas";
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  NODE_COLORS,
  NODE_SHAPES,
} from "@/types/canvas";

const MAX_CANVAS_NODES = 300;
const MAX_CANVAS_EDGES = 600;
const MAX_CANVAS_ID_LENGTH = 160;
const MAX_CANVAS_LABEL_LENGTH = 240;
const MAX_HANDLE_ID_LENGTH = 160;
const MIN_CANVAS_NODE_SIZE = 16;
const MAX_CANVAS_NODE_SIZE = 2000;
const MAX_CANVAS_POSITION = 100000;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidShortString(value: unknown, maxLength: number) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxLength
  );
}

function isValidOptionalString(value: unknown, maxLength: number) {
  return (
    value === undefined ||
    (typeof value === "string" && value.length <= maxLength)
  );
}

function isCanvasPosition(value: unknown) {
  return (
    isRecord(value) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    Math.abs(value.x) <= MAX_CANVAS_POSITION &&
    Math.abs(value.y) <= MAX_CANVAS_POSITION
  );
}

function isCanvasNodeColor(value: unknown) {
  return (
    isRecord(value) &&
    NODE_COLORS.some(
      (color) => color.fill === value.fill && color.text === value.text,
    )
  );
}

function isCanvasNodeStyle(value: unknown): value is CSSProperties | undefined {
  if (value === undefined) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  for (const key of ["width", "height"]) {
    const dimension = value[key];

    if (dimension !== undefined) {
      if (!isFiniteNumber(dimension)) {
        return false;
      }

      if (
        dimension < MIN_CANVAS_NODE_SIZE ||
        dimension > MAX_CANVAS_NODE_SIZE
      ) {
        return false;
      }
    }
  }

  return true;
}

function isCanvasNode(value: unknown): value is CanvasNode {
  if (
    !isRecord(value) ||
    !isValidShortString(value.id, MAX_CANVAS_ID_LENGTH) ||
    value.type !== CANVAS_NODE_TYPE ||
    !isCanvasPosition(value.position) ||
    !isCanvasNodeStyle(value.style) ||
    !isRecord(value.data)
  ) {
    return false;
  }

  return (
    typeof value.data.label === "string" &&
    value.data.label.length <= MAX_CANVAS_LABEL_LENGTH &&
    isCanvasNodeColor(value.data.color) &&
    typeof value.data.shape === "string" &&
    NODE_SHAPES.includes(
      value.data.shape as (typeof NODE_SHAPES)[number],
    )
  );
}

function isCanvasEdge(value: unknown): value is CanvasEdge {
  if (
    !isRecord(value) ||
    !isValidShortString(value.id, MAX_CANVAS_ID_LENGTH) ||
    !isValidShortString(value.source, MAX_CANVAS_ID_LENGTH) ||
    !isValidShortString(value.target, MAX_CANVAS_ID_LENGTH) ||
    value.type !== CANVAS_EDGE_TYPE ||
    !isValidOptionalString(value.sourceHandle, MAX_HANDLE_ID_LENGTH) ||
    !isValidOptionalString(value.targetHandle, MAX_HANDLE_ID_LENGTH)
  ) {
    return false;
  }

  if (value.data === undefined) {
    return true;
  }

  return (
    isRecord(value.data) &&
    typeof value.data.label === "string" &&
    value.data.label.length <= MAX_CANVAS_LABEL_LENGTH
  );
}

export function isCanvasSnapshot(value: unknown): value is CanvasSnapshot {
  if (
    !isRecord(value) ||
    !Array.isArray(value.nodes) ||
    !Array.isArray(value.edges) ||
    value.nodes.length > MAX_CANVAS_NODES ||
    value.edges.length > MAX_CANVAS_EDGES ||
    !value.nodes.every(isCanvasNode) ||
    !value.edges.every(isCanvasEdge)
  ) {
    return false;
  }

  const nodeIds = new Set(value.nodes.map((node) => node.id));

  return (
    nodeIds.size === value.nodes.length &&
    value.edges.every(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
    )
  );
}

export function createCanvasSnapshot(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
): CanvasSnapshot {
  return {
    edges,
    nodes,
  };
}
