"use client";

import { FormEvent } from "react";

import { EditorDialogContent } from "@/components/editor/editor-dialog";
import type { MockProject } from "@/hooks/use-project-dialogs";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ProjectDialogState {
  mode: "create" | "rename" | "delete";
  project?: MockProject;
}

interface ProjectDialogsProps {
  dialogState: ProjectDialogState | null;
  isLoading: boolean;
  projectName: string;
  slugPreview: string;
  onClose: () => void;
  onProjectNameChange: (value: string) => void;
  onSubmit: () => void;
}

export function ProjectDialogs({
  dialogState,
  isLoading,
  projectName,
  slugPreview,
  onClose,
  onProjectNameChange,
  onSubmit,
}: ProjectDialogsProps) {
  const isOpen = dialogState !== null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {dialogState?.mode === "create" ? (
        <EditorDialogContent
          title="Create Project"
          description="Name the new architecture workspace."
          footer={
            <>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" form="create-project-form" disabled={isLoading}>
                Create Project
              </Button>
            </>
          }
        >
          <form
            id="create-project-form"
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label
                htmlFor="project-name"
                className="text-sm font-medium text-copy-primary"
              >
                Project name
              </label>
              <Input
                id="project-name"
                className="text-copy-primary placeholder:text-copy-muted"
                value={projectName}
                onChange={(event) => onProjectNameChange(event.target.value)}
                placeholder="Payments architecture"
              />
            </div>
            <p className="text-sm text-copy-muted">
              Slug preview:{" "}
              <span className="font-mono text-brand">{slugPreview}</span>
            </p>
          </form>
        </EditorDialogContent>
      ) : null}

      {dialogState?.mode === "rename" ? (
        <EditorDialogContent
          title="Rename Project"
          description={`Current project: ${dialogState.project?.name ?? "Untitled project"}`}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" form="rename-project-form" disabled={isLoading}>
                Save Name
              </Button>
            </>
          }
        >
          <form
            id="rename-project-form"
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label
                htmlFor="rename-project-name"
                className="text-sm font-medium text-copy-primary"
              >
                Project name
              </label>
              <Input
                className="text-copy-primary placeholder:text-copy-muted"
                id="rename-project-name"
                autoFocus
                value={projectName}
                onChange={(event) => onProjectNameChange(event.target.value)}
              />
            </div>
            <p className="text-sm text-copy-muted">
              Slug preview:{" "}
              <span className="font-mono text-brand">{slugPreview}</span>
            </p>
          </form>
        </EditorDialogContent>
      ) : null}

      {dialogState?.mode === "delete" ? (
        <EditorDialogContent
          title="Delete Project"
          description={`This will delete ${dialogState.project?.name ?? "this project"}. This action cannot be undone.`}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isLoading}
                onClick={onSubmit}
              >
                Delete Project
              </Button>
            </>
          }
        />
      ) : null}
    </Dialog>
  );
}
