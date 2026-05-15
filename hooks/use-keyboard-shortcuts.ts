"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

interface UseKeyboardShortcutsOptions {
  reactFlowInstance: ReactFlowInstance<CanvasNode, CanvasEdge> | null;
  onRedo: () => void;
  onUndo: () => void;
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.isContentEditable ||
      target.closest("input, textarea, select, [contenteditable]"),
  );
}

export function useKeyboardShortcuts({
  reactFlowInstance,
  onRedo,
  onUndo,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const hasModifier = event.metaKey || event.ctrlKey;

      if (key === "+" || key === "=") {
        event.preventDefault();
        void reactFlowInstance?.zoomIn({ duration: 180 });
        return;
      }

      if (key === "-") {
        event.preventDefault();
        void reactFlowInstance?.zoomOut({ duration: 180 });
        return;
      }

      if (hasModifier && key === "z" && event.shiftKey) {
        event.preventDefault();
        onRedo();
        return;
      }

      if (hasModifier && key === "z") {
        event.preventDefault();
        onUndo();
        return;
      }

      if (hasModifier && key === "y") {
        event.preventDefault();
        onRedo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onRedo, onUndo, reactFlowInstance]);
}
