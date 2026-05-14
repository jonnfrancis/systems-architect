"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const projectDialogs = useProjectDialogs();

  return (
    <main className="min-h-screen overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
      />
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
        ownedProjects={projectDialogs.ownedProjects}
        sharedProjects={projectDialogs.sharedProjects}
        onClose={() => setIsSidebarOpen(false)}
        onCreateProject={projectDialogs.openCreateDialog}
        onDeleteProject={projectDialogs.openDeleteDialog}
        onRenameProject={projectDialogs.openRenameDialog}
      />

      <section className="flex min-h-screen items-center justify-center pt-14">
        <div className="max-w-xl px-6 text-center">
          <h1 className="text-3xl font-semibold text-copy-primary">
            Create a project or open an existing one
          </h1>
          <p className="mt-3 text-sm leading-6 text-copy-muted">
            Start a new architecture workspace, or choose a project from the
            sidebar.
          </p>
          <Button
            type="button"
            className="mt-6"
            onClick={projectDialogs.openCreateDialog}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </section>

      <ProjectDialogs
        dialogState={projectDialogs.dialogState}
        isLoading={projectDialogs.isLoading}
        projectName={projectDialogs.projectName}
        slugPreview={projectDialogs.slugPreview}
        onClose={projectDialogs.closeDialog}
        onProjectNameChange={projectDialogs.setProjectName}
        onSubmit={projectDialogs.submitDialog}
      />
    </main>
  );
}
