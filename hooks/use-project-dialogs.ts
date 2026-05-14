"use client";

import { useMemo, useState } from "react";

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "collaborator";
}

type DialogMode = "create" | "rename" | "delete";

interface ProjectDialogState {
  mode: DialogMode;
  project?: MockProject;
}

const initialProjects: MockProject[] = [
  {
    id: "ghost-marketplace",
    name: "Ghost Marketplace",
    slug: "ghost-marketplace",
    role: "owner",
  },
  {
    id: "event-pipeline",
    name: "Event Pipeline",
    slug: "event-pipeline",
    role: "owner",
  },
  {
    id: "shared-observability",
    name: "Shared Observability",
    slug: "shared-observability",
    role: "collaborator",
  },
];

function createSlug(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project"
  );
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState<MockProject[]>(initialProjects);
  const [dialogState, setDialogState] = useState<ProjectDialogState | null>(
    null,
  );
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const slugPreview = useMemo(() => createSlug(projectName), [projectName]);

  const ownedProjects = projects.filter((project) => project.role === "owner");
  const sharedProjects = projects.filter(
    (project) => project.role === "collaborator",
  );

  function openCreateDialog() {
    setProjectName("");
    setDialogState({ mode: "create" });
  }

  function openRenameDialog(project: MockProject) {
    setProjectName(project.name);
    setDialogState({ mode: "rename", project });
  }

  function openDeleteDialog(project: MockProject) {
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

  function submitDialog() {
    if (!dialogState) {
      return;
    }

    const nextName = projectName.trim();

    if (dialogState.mode !== "delete" && !nextName) {
      return;
    }

    setIsLoading(true);

    if (dialogState.mode === "create") {
      const slug = createSlug(nextName);
      if(!slug) return setIsLoading(false)
      

      setProjects((currentProjects) => [
        {
          id: `${slug}-${Date.now()}`,
          name: nextName,
          slug,
          role: "owner",
        },
        ...currentProjects,
      ]);
    }

    if (dialogState.mode === "rename" && dialogState.project) {
      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === dialogState.project?.id
            ? { ...project, name: nextName, slug: createSlug(nextName) }
            : project,
        ),
      );
    }

    if (dialogState.mode === "delete" && dialogState.project) {
      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) => project.id !== dialogState.project?.id,
        ),
      );
    }

    setIsLoading(false);
    setDialogState(null);
    setProjectName("");
  }

  return {
    dialogState,
    isLoading,
    ownedProjects,
    projectName,
    projects,
    sharedProjects,
    slugPreview,
    closeDialog,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    setProjectName,
    submitDialog,
  };
}
