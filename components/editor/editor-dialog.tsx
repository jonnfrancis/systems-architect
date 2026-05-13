"use client";

import type { ReactNode } from "react";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EditorDialogContentProps {
  title: string;
  description?: string;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function EditorDialogContent({
  title,
  description,
  footer,
  children,
  className,
}: EditorDialogContentProps) {
  return (
    <DialogContent
      className={cn("border-surface-border bg-elevated", className)}
    >
      <DialogHeader>
        <DialogTitle className="text-copy-primary">{title}</DialogTitle>
        {description ? (
          <DialogDescription className="text-copy-muted">
            {description}
          </DialogDescription>
        ) : null}
      </DialogHeader>

      {children}

      {footer ? <DialogFooter>{footer}</DialogFooter> : null}
    </DialogContent>
  );
}
