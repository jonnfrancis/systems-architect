"use client";

import { PanelLeftClose, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function EmptyProjectsState() {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-subtle/45 px-5 text-center">
      <p className="text-sm font-medium text-copy-primary">No projects yet</p>
      <p className="mt-2 max-w-48 text-sm leading-6 text-copy-muted">
        Project lists will appear here once project storage is connected.
      </p>
    </div>
  );
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-4 top-18 z-30 flex h-[calc(100vh-5rem)] w-80 flex-col rounded-2xl border border-surface-border bg-surface/95 shadow-2xl shadow-background/40 backdrop-blur transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]",
      )}
      aria-hidden={!isOpen}
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
            <EmptyProjectsState />
          </TabsContent>
          <TabsContent value="shared" className="mt-0">
            <EmptyProjectsState />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="shrink-0 border-t border-surface-border p-4">
        <Button type="button" className="w-full">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
