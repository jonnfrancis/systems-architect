"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { ProjectSummary } from "@/types/project";

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
  const values = new Uint8Array(4);
  crypto.getRandomValues(values);

  return Array.from(values, (value) => value.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 6);
}

async function readProjectResponse(response: Response) {
  if (!response.ok) {
    throw new Error("Project request failed.");
  }

  return (await response.json()) as ProjectResponse;
}

export function createRoomId(projectName: string, suffix: string) {
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
