import type { CanvasEdge, CanvasNode, CanvasSnapshot } from "@/types/canvas";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCanvasElement(value: unknown): value is CanvasNode | CanvasEdge {
  return isRecord(value) && typeof value.id === "string";
}

function isCanvasElementArray(
  value: unknown,
): value is CanvasNode[] | CanvasEdge[] {
  return Array.isArray(value) && value.every(isCanvasElement);
}

export function isCanvasSnapshot(value: unknown): value is CanvasSnapshot {
  return (
    isRecord(value) &&
    isCanvasElementArray(value.nodes) &&
    isCanvasElementArray(value.edges)
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
