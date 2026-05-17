"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { createCanvasSnapshot } from "@/lib/canvas-snapshot";
import type { CanvasEdge, CanvasNode, CanvasSnapshot } from "@/types/canvas";

const CANVAS_AUTOSAVE_DEBOUNCE_MS = 1200;

export type CanvasSaveStatus = "saving" | "saved" | "error";

interface UseCanvasAutosaveOptions {
  edges: CanvasEdge[];
  enabled: boolean;
  nodes: CanvasNode[];
  projectId: string;
}

function serializeSnapshot(snapshot: CanvasSnapshot) {
  return JSON.stringify(snapshot);
}

async function readCanvasSaveErrorMessage(response: Response) {
  const responseText = await response.text();

  try {
    const parsedBody = JSON.parse(responseText) as unknown;

    if (
      typeof parsedBody === "object" &&
      parsedBody !== null &&
      "error" in parsedBody &&
      typeof parsedBody.error === "string"
    ) {
      return parsedBody.error;
    }
  } catch {
    // Fall through to raw text handling below.
  }

  return responseText.trim() || "Canvas save failed.";
}

export function useCanvasAutosave({
  edges,
  enabled,
  nodes,
  projectId,
}: UseCanvasAutosaveOptions) {
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>("saved");
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const snapshot = useMemo(
    () => createCanvasSnapshot(nodes, edges),
    [edges, nodes],
  );
  const serializedSnapshot = useMemo(
    () => serializeSnapshot(snapshot),
    [snapshot],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (serializedSnapshot === lastSavedSnapshotRef.current) {
      setSaveStatus("saved");
      return;
    }

    const abortController = new AbortController();
    const saveTimeout = window.setTimeout(async () => {
      setSaveStatus("saving");

      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          body: serializedSnapshot,
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(await readCanvasSaveErrorMessage(response));
        }

        lastSavedSnapshotRef.current = serializedSnapshot;
        setSaveStatus("saved");
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        console.error("Canvas autosave failed:", error);
        setSaveStatus("error");
      }
    }, CANVAS_AUTOSAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(saveTimeout);
      abortController.abort();
    };
  }, [enabled, projectId, serializedSnapshot]);

  return saveStatus;
}
