"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-surface-border bg-surface/95 px-4 backdrop-blur">
      <div className="flex flex-1 items-center justify-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            isSidebarOpen ? "Close project sidebar" : "Open project sidebar"
          }
          onClick={onToggleSidebar}
        >
          <SidebarIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm font-medium text-copy-primary">Ghost AI</div>
      </div>

      <div className="flex flex-1 items-center justify-end" />
    </header>
  );
}
