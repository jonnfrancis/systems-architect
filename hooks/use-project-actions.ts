"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { ProjectSummary } from "@/types/project";
import { toast } from "react-hot-toast";

type DialogMode = "create" | "rename" | "delete";

interface ProjectDialogState {
  mode: DialogMode;
  project?: ProjectSummary;
}

interface ProjectResponse {
  project: ProjectSummary;
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project"
  );
}

function createShortSuffix() {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  const values = new Uint8Array(6);
  crypto.getRandomValues(values);

  for (const value of values) {
    result += chars[value % chars.length];
  }

  return result;
}

async function readProjectResponse(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? "Project request failed.";
    throw new Error(message);
  }

  return data as ProjectResponse;
}

function createRoomId(projectName: string, suffix: string) {
  return `${slugify(projectName)}-${suffix}`;
}

export function useProjectActions() {
  const router = useRouter();
  const pathname = usePathname();
  const activeRoomId = pathname.startsWith("/editor/")
    ? pathname.split("/")[2]
    : null;

  const [dialogState, setDialogState] = useState<ProjectDialogState | null>(
    null,
  );
  const [projectName, setProjectName] = useState("");
  const [roomSuffix, setRoomSuffix] = useState(createShortSuffix);
  const [isLoading, setIsLoading] = useState(false);

  const roomIdPreview = useMemo(
    () => createRoomId(projectName, roomSuffix),
    [projectName, roomSuffix],
  );

  function openCreateDialog() {
    setProjectName("");
    setRoomSuffix(createShortSuffix());
    setDialogState({ mode: "create" });
  }

  function openRenameDialog(project: ProjectSummary) {
    setProjectName(project.name);
    setDialogState({ mode: "rename", project });
  }

  function openDeleteDialog(project: ProjectSummary) {
    setProjectName(project.name);
    setDialogState({ mode: "delete", project });
  }

  function closeDialog() {
    if (isLoading) {
      return;
    }

    setDialogState(null);
    setProjectName("");
  }

  async function submitDialog() {
    if (!dialogState) {
      return;
    }

    const nextName = projectName.trim();

    if (dialogState.mode !== "delete" && !nextName) {
      return;
    }

    setIsLoading(true);

    try {
      if (dialogState.mode === "create") {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: roomIdPreview,
            name: nextName,
          }),
        });

        // Let readProjectResponse throw a descriptive error
        const { project } = await readProjectResponse(response);

        router.push(`/editor/${project.id}`);
        return;
      }

      if (dialogState.mode === "rename" && dialogState.project) {
        await readProjectResponse(
          await fetch(`/api/projects/${dialogState.project.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: nextName }),
          }),
        );

        setDialogState(null);
        setProjectName("");
        router.refresh();
        return;
      }

      if (dialogState.mode === "delete" && dialogState.project) {
        await readProjectResponse(
          await fetch(`/api/projects/${dialogState.project.id}`, {
            method: "DELETE",
          }),
        );

        setDialogState(null);
        setProjectName("");

        if (activeRoomId === dialogState.project.id) {
          router.push("/editor");
          return;
        }

        router.refresh();
      }
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Project request failed.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    dialogState,
    isLoading,
    projectName,
    roomIdPreview,
    closeDialog,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    setProjectName,
    submitDialog,
  };
}
