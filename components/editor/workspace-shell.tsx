"use client";

import { useState } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  LayoutTemplate,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Share2,
} from "lucide-react";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { CanvasWorkspace } from "@/components/editor/canvas-workspace";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { Button } from "@/components/ui/button";
import { useProjectActions } from "@/hooks/use-project-actions";
import { cn } from "@/lib/utils";
import type { CanvasSaveStatus } from "@/hooks/use-canvas-autosave";
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

function getSaveStatusDisplay(status: CanvasSaveStatus) {
  if (status === "saving") {
    return {
      className: "text-copy-muted",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      label: "Saving",
    };
  }

  if (status === "error") {
    return {
      className: "text-state-error",
      icon: <AlertCircle className="h-4 w-4" />,
      label: "Error",
    };
  }

  return {
    className: "text-state-success",
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Saved",
  };
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
  const [saveStatus, setSaveStatus] = useState<CanvasSaveStatus>("saved");
  const [templateImportRequest, setTemplateImportRequest] =
    useState<TemplateImportRequest | null>(null);
  const projectActions = useProjectActions();
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const saveStatusDisplay = getSaveStatusDisplay(saveStatus);

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
            disabled
            className={cn(
              "disabled:opacity-100",
              saveStatusDisplay.className,
            )}
          >
            <Save className="h-4 w-4" />
            {saveStatusDisplay.icon}
            {saveStatusDisplay.label}
          </Button>
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
          onSaveStatusChange={setSaveStatus}
          roomId={project.id}
          templateImportRequest={templateImportRequest}
        />

        <AiSidebar
          isOpen={isAiSidebarOpen}
          onClose={() => setIsAiSidebarOpen(false)}
        />
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
