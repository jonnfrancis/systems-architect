"use client";

import type { ComponentType, DragEvent } from "react";
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SHAPE_DRAG_MIME_TYPE,
  type CanvasNodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";

interface ShapeDefinition {
  shape: CanvasNodeShape;
  label: string;
  width: number;
  height: number;
  Icon: ComponentType<{ className?: string }>;
}

export const SHAPE_DEFINITIONS: ShapeDefinition[] = [
  {
    shape: "rectangle",
    label: "Rectangle",
    width: 168,
    height: 92,
    Icon: RectangleHorizontal,
  },
  {
    shape: "diamond",
    label: "Diamond",
    width: 128,
    height: 128,
    Icon: Diamond,
  },
  {
    shape: "circle",
    label: "Circle",
    width: 104,
    height: 104,
    Icon: Circle,
  },
  {
    shape: "pill",
    label: "Pill",
    width: 156,
    height: 72,
    Icon: Pill,
  },
  {
    shape: "cylinder",
    label: "Cylinder",
    width: 132,
    height: 104,
    Icon: Cylinder,
  },
  {
    shape: "hexagon",
    label: "Hexagon",
    width: 132,
    height: 104,
    Icon: Hexagon,
  },
];

function createShapePayload(definition: ShapeDefinition): ShapeDragPayload {
  return {
    shape: definition.shape,
    width: definition.width,
    height: definition.height,
  };
}

export function ShapePanel() {
  function handleDragStart(
    event: DragEvent<HTMLButtonElement>,
    definition: ShapeDefinition,
  ) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      SHAPE_DRAG_MIME_TYPE,
      JSON.stringify(createShapePayload(definition)),
    );
  }

  return (
    <div className="pointer-events-auto absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-2xl shadow-background/50 backdrop-blur">
      {SHAPE_DEFINITIONS.map((definition) => {
        const Icon = definition.Icon;

        return (
          <Button
            key={definition.shape}
            type="button"
            variant="ghost"
            size="icon"
            draggable
            aria-label={`Add ${definition.label}`}
            title={definition.label}
            onDragStart={(event) => handleDragStart(event, definition)}
          >
            <Icon className="h-5 w-5" />
          </Button>
        );
      })}
    </div>
  );
}
