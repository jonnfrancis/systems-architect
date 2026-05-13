"use client";

import { useState } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <main className="min-h-screen overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <section className="flex min-h-screen items-center justify-center pt-14">
        <div className="text-center">
          <p className="text-sm font-medium text-copy-muted">Editor canvas</p>
          <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
            Systems Architecture
          </h1>
        </div>
      </section>
    </main>
  );
}
