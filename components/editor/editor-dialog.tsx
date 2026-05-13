"use client";

import type { ComponentProps, ReactNode } from "react";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EditorDialogContentProps
  extends ComponentProps<typeof DialogContent> {
  title: string;
  description?: string;
  footer?: ReactNode;
  children?: ReactNode;
}

export function EditorDialogContent({
  title,
  description,
  footer,
  children,
  className,
  ...props
}: EditorDialogContentProps) {
  return (
    <DialogContent
      className={cn("border-surface-border bg-elevated", className)}
      {...props}
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
