"use client";

import { useState } from "react";
import { Bot, PanelLeftClose, PanelLeftOpen, Share2 } from "lucide-react";

import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { Button } from "@/components/ui/button";
import { useProjectActions } from "@/hooks/use-project-actions";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "@/types/project";

interface WorkspaceShellProps {
  project: ProjectSummary;
  ownedProjects: ProjectSummary[];
  sharedProjects: ProjectSummary[];
}

export function WorkspaceShell({
  project,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const projectActions = useProjectActions();
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <main className="min-h-screen overflow-hidden bg-base text-copy-primary">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-surface-border bg-surface/95 px-4 backdrop-blur">
        <div className="flex flex-1 items-center justify-start gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={
              isSidebarOpen ? "Close project sidebar" : "Open project sidebar"
            }
            onClick={() => setIsSidebarOpen((current) => !current)}
          >
            <SidebarIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-medium text-copy-primary">
            {project.name}
          </p>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            onClick={() => setIsAiSidebarOpen((current) => !current)}
          >
            <Bot className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <button
        type="button"
        aria-label="Close project sidebar"
        className={cn(
          "fixed inset-0 z-20 bg-background/70 backdrop-blur-sm transition-opacity md:hidden",
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      <ProjectSidebar
        isOpen={isSidebarOpen}
        activeProjectId={project.id}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onClose={() => setIsSidebarOpen(false)}
        onCreateProject={projectActions.openCreateDialog}
        onDeleteProject={projectActions.openDeleteDialog}
        onRenameProject={projectActions.openRenameDialog}
      />

      <section className="flex h-screen pt-14">
        <div className="flex min-w-0 flex-1 items-center justify-center bg-base px-6">
          <div className="text-center">
            <p className="text-sm font-medium text-copy-primary">
              Canvas workspace
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-copy-muted">
              Canvas logic will be added in the next implementation phase.
            </p>
          </div>
        </div>

        <aside
          className={cn(
            "hidden w-80 shrink-0 border-l border-surface-border bg-surface/95 transition-[width] duration-200 ease-out lg:block",
            !isAiSidebarOpen && "w-0 overflow-hidden border-l-0",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-14 shrink-0 items-center border-b border-surface-border px-4">
              <p className="text-sm font-semibold text-copy-primary">AI Chat</p>
            </div>
            <div className="flex flex-1 items-center justify-center px-5 text-center">
              <p className="text-sm leading-6 text-copy-muted">
                AI sidebar placeholder.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <ProjectDialogs
        dialogState={projectActions.dialogState}
        isLoading={projectActions.isLoading}
        projectName={projectActions.projectName}
        roomIdPreview={projectActions.roomIdPreview}
        onClose={projectActions.closeDialog}
        onProjectNameChange={projectActions.setProjectName}
        onSubmit={projectActions.submitDialog}
      />

      <ShareDialog
        isOpen={isShareDialogOpen}
        canManage={project.role === "owner"}
        projectId={project.id}
        projectName={project.name}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </main>
  );
}
