"use client";

import { useState } from "react";
import {
  Bot,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
} from "lucide-react";

import { CanvasWorkspace } from "@/components/editor/canvas-workspace";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { Button } from "@/components/ui/button";
import { useProjectActions } from "@/hooks/use-project-actions";
import { cn } from "@/lib/utils";
import type { ProjectSummary } from "@/types/project";

interface WorkspaceShellProps {
  project: ProjectSummary;
  ownedProjects: ProjectSummary[];
  sharedProjects: ProjectSummary[];
}

interface TemplateImportRequest {
  id: number;
  template: CanvasTemplate;
}

export function WorkspaceShell({
  project,
  ownedProjects,
  sharedProjects,
}: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isStarterTemplatesOpen, setIsStarterTemplatesOpen] = useState(false);
  const [templateImportRequest, setTemplateImportRequest] =
    useState<TemplateImportRequest | null>(null);
  const projectActions = useProjectActions();
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  function importTemplate(template: CanvasTemplate) {
    setTemplateImportRequest((current) => ({
      id: (current?.id ?? 0) + 1,
      template,
    }));
  }

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
            onClick={() => setIsStarterTemplatesOpen(true)}
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
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

      <section className="h-screen pt-14">
        <CanvasWorkspace
          roomId={project.id}
          templateImportRequest={templateImportRequest}
        />

        <aside
          className={cn(
            "fixed right-4 top-18 z-30 hidden h-[calc(100vh-5rem)] w-80 flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-2xl shadow-background/40 backdrop-blur transition-transform duration-200 ease-out lg:flex",
            isAiSidebarOpen
              ? "translate-x-0"
              : "pointer-events-none translate-x-[calc(100%+2rem)]",
          )}
          aria-hidden={!isAiSidebarOpen}
          inert={!isAiSidebarOpen}
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

      <StarterTemplatesModal
        isOpen={isStarterTemplatesOpen}
        onClose={() => setIsStarterTemplatesOpen(false)}
        onImport={importTemplate}
      />
    </main>
  );
}
