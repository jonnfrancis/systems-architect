"use client";

import Link from "next/link";
import { Pencil, PanelLeftClose, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "@/types/project";

interface ProjectSidebarProps {
  isOpen: boolean;
  ownedProjects: ProjectSummary[];
  sharedProjects: ProjectSummary[];
  onClose: () => void;
  onCreateProject: () => void;
  onDeleteProject: (project: ProjectSummary) => void;
  onRenameProject: (project: ProjectSummary) => void;
}

interface ProjectListProps {
  projects: ProjectSummary[];
  showActions?: boolean;
  onDeleteProject: (project: ProjectSummary) => void;
  onRenameProject: (project: ProjectSummary) => void;
}

function EmptyProjectsState({ label }: { label: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-subtle/45 px-5 text-center">
      <p className="text-sm font-medium text-copy-primary">{label}</p>
      <p className="mt-2 max-w-48 text-sm leading-6 text-copy-muted">
        Create a workspace or accept an invite to see projects here.
      </p>
    </div>
  );
}

function ProjectList({
  projects,
  showActions = false,
  onDeleteProject,
  onRenameProject,
}: ProjectListProps) {
  if (projects.length === 0) {
    return <EmptyProjectsState label="No projects yet" />;
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <div
          key={project.id}
          className="group flex items-center justify-between gap-3 rounded-2xl border border-surface-border bg-subtle/45 px-3 py-3"
        >
          <Link href={`/editor/${project.id}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-copy-primary">
              {project.name}
            </p>
            <p className="mt-1 truncate font-mono text-xs text-copy-muted">
              {project.id}
            </p>
          </Link>

          {showActions ? (
            <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Rename ${project.name}`}
                onClick={() => onRenameProject(project)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete ${project.name}`}
                onClick={() => onDeleteProject(project)}
              >
                <Trash2 className="h-4 w-4 text-state-error" />
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  ownedProjects,
  sharedProjects,
  onClose,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
}: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-4 top-18 z-30 flex h-[calc(100vh-5rem)] w-80 flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-2xl shadow-background/40 backdrop-blur transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)] pointer-events-none",
      )}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-4">
        <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close project sidebar"
          onClick={onClose}
        >
          <PanelLeftClose className="h-5 w-5" />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="min-h-0 flex-1 px-4 py-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <ScrollArea className="mt-4 h-[calc(100%-3.25rem)]">
          <TabsContent value="my-projects" className="mt-0">
            <ProjectList
              projects={ownedProjects}
              showActions
              onDeleteProject={onDeleteProject}
              onRenameProject={onRenameProject}
            />
          </TabsContent>
          <TabsContent value="shared" className="mt-0">
            <ProjectList
              projects={sharedProjects}
              onDeleteProject={onDeleteProject}
              onRenameProject={onRenameProject}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="shrink-0 border-t border-surface-border p-4">
        <Button type="button" className="w-full" onClick={onCreateProject}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
