"use client";

import { useMemo } from "react";

import { EditorDialogContent } from "@/components/editor/editor-dialog";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CanvasNode } from "@/types/canvas";

interface StarterTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (template: CanvasTemplate) => void;
}

interface TemplatePreviewBounds {
  height: number;
  width: number;
  x: number;
  y: number;
}

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 160;
const PREVIEW_PADDING = 18;

function getNodeWidth(node: CanvasNode) {
  return typeof node.style?.width === "number" ? node.style.width : 144;
}

function getNodeHeight(node: CanvasNode) {
  return typeof node.style?.height === "number" ? node.style.height : 72;
}

function getNodeCenter(node: CanvasNode) {
  return {
    x: node.position.x + getNodeWidth(node) / 2,
    y: node.position.y + getNodeHeight(node) / 2,
  };
}

function getPreviewBounds(nodes: CanvasNode[]): TemplatePreviewBounds {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT };
  }

  const bounds = nodes.reduce(
    (current, node) => {
      const width = getNodeWidth(node);
      const height = getNodeHeight(node);

      return {
        minX: Math.min(current.minX, node.position.x),
        minY: Math.min(current.minY, node.position.y),
        maxX: Math.max(current.maxX, node.position.x + width),
        maxY: Math.max(current.maxY, node.position.y + height),
      };
    },
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );

  return {
    x: bounds.minX,
    y: bounds.minY,
    width: Math.max(bounds.maxX - bounds.minX, 1),
    height: Math.max(bounds.maxY - bounds.minY, 1),
  };
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = useMemo(
    () => getPreviewBounds(template.nodes),
    [template.nodes],
  );
  const nodesById = useMemo(
    () => new Map(template.nodes.map((node) => [node.id, node])),
    [template.nodes],
  );
  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / bounds.width,
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / bounds.height,
  );
  const offsetX =
    PREVIEW_PADDING + (PREVIEW_WIDTH - PREVIEW_PADDING * 2 - bounds.width * scale) / 2;
  const offsetY =
    PREVIEW_PADDING + (PREVIEW_HEIGHT - PREVIEW_PADDING * 2 - bounds.height * scale) / 2;

  function projectPoint(point: { x: number; y: number }) {
    return {
      x: (point.x - bounds.x) * scale + offsetX,
      y: (point.y - bounds.y) * scale + offsetY,
    };
  }

  return (
    <svg
      aria-hidden="true"
      className="h-40 w-full rounded-xl border border-surface-border bg-base"
      role="img"
      viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
    >
      {template.edges.map((edge) => {
        const source = nodesById.get(edge.source);
        const target = nodesById.get(edge.target);

        if (!source || !target) {
          return null;
        }

        const from = projectPoint(getNodeCenter(source));
        const to = projectPoint(getNodeCenter(target));

        return (
          <line
            key={edge.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="var(--text-primary)"
            strokeLinecap="round"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />
        );
      })}

      {template.nodes.map((node) => {
        const x = (node.position.x - bounds.x) * scale + offsetX;
        const y = (node.position.y - bounds.y) * scale + offsetY;
        const width = getNodeWidth(node) * scale;
        const height = getNodeHeight(node) * scale;

        if (node.data.shape === "circle" || node.data.shape === "pill") {
          return (
            <rect
              key={node.id}
              x={x}
              y={y}
              width={width}
              height={height}
              rx={height / 2}
              fill={node.data.color.fill}
              stroke={node.data.color.text}
              strokeOpacity="0.75"
              strokeWidth="1.4"
            />
          );
        }

        if (node.data.shape === "diamond") {
          return (
            <polygon
              key={node.id}
              points={`${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`}
              fill={node.data.color.fill}
              stroke={node.data.color.text}
              strokeOpacity="0.75"
              strokeWidth="1.4"
            />
          );
        }

        if (node.data.shape === "hexagon") {
          return (
            <polygon
              key={node.id}
              points={`${x + width * 0.25},${y} ${x + width * 0.75},${y} ${x + width},${y + height / 2} ${x + width * 0.75},${y + height} ${x + width * 0.25},${y + height} ${x},${y + height / 2}`}
              fill={node.data.color.fill}
              stroke={node.data.color.text}
              strokeOpacity="0.75"
              strokeWidth="1.4"
            />
          );
        }

        if (node.data.shape === "cylinder") {
          const capHeight = Math.min(height * 0.26, 12);

          return (
            <g key={node.id}>
              <path
                d={`M ${x} ${y + capHeight / 2} C ${x} ${y - capHeight / 2} ${x + width} ${y - capHeight / 2} ${x + width} ${y + capHeight / 2} L ${x + width} ${y + height - capHeight / 2} C ${x + width} ${y + height + capHeight / 2} ${x} ${y + height + capHeight / 2} ${x} ${y + height - capHeight / 2} Z`}
                fill={node.data.color.fill}
                stroke={node.data.color.text}
                strokeOpacity="0.75"
                strokeWidth="1.4"
              />
              <ellipse
                cx={x + width / 2}
                cy={y + capHeight / 2}
                rx={width / 2}
                ry={capHeight / 2}
                fill={node.data.color.fill}
                stroke={node.data.color.text}
                strokeOpacity="0.75"
                strokeWidth="1.4"
              />
              <path
                d={`M ${x} ${y + height - capHeight / 2} C ${x} ${y + height + capHeight / 2} ${x + width} ${y + height + capHeight / 2} ${x + width} ${y + height - capHeight / 2}`}
                fill="none"
                stroke={node.data.color.text}
                strokeOpacity="0.55"
                strokeWidth="1.4"
              />
            </g>
          );
        }

        return (
          <rect
            key={node.id}
            x={x}
            y={y}
            width={width}
            height={height}
            rx="8"
            fill={node.data.color.fill}
            stroke={node.data.color.text}
            strokeOpacity="0.75"
            strokeWidth="1.4"
          />
        );
      })}
    </svg>
  );
}

export function StarterTemplatesModal({
  isOpen,
  onClose,
  onImport,
}: StarterTemplatesModalProps) {
  function importTemplate(template: CanvasTemplate) {
    onImport(template);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <EditorDialogContent
        title="Starter templates"
        description="Replace the current canvas with a predefined system design."
        className="max-w-[min(1520px,95vw)]!"
      >
        <ScrollArea className="pr-4">
          <div className="grid gap-4 md:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <article
                key={template.id}
                className="flex min-h-80 flex-col rounded-2xl border border-surface-border bg-subtle/45 p-3"
              >
                <TemplatePreview template={template} />
                <div className="mt-4 flex flex-1 flex-col">
                  <h3 className="text-sm font-semibold text-copy-primary">
                    {template.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-copy-muted">
                    {template.description}
                  </p>
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    onClick={() => importTemplate(template)}
                  >
                    Import
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </ScrollArea>
      </EditorDialogContent>
    </Dialog>
  );
}
