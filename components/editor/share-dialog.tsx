"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Copy, Trash2, UserRoundPlus } from "lucide-react";
import { toast } from "react-hot-toast";

import { EditorDialogContent } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  CollaboratorSummary,
  CollaboratorsResponse,
  ProjectOwnerSummary,
} from "@/types/collaborator";

interface ShareDialogProps {
  isOpen: boolean;
  canManage: boolean;
  projectId: string;
  projectName: string;
  onClose: () => void;
}

interface CollaboratorMutationResponse {
  collaborator: CollaboratorSummary;
}

interface PersonWithAccess {
  id: string;
  email: string | null;
  displayName: string | null;
  imageUrl: string | null;
  role: "Owner" | "Collaborator";
  collaboratorId?: string;
}

function getInitials(person: PersonWithAccess) {
  const source = person.displayName ?? person.email ?? person.id;
  const parts = source.split(/\s+|@/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data.error === "string"
        ? data.error
        : "Share request failed.";
    throw new Error(message);
  }

  return data as T;
}

export function ShareDialog({
  isOpen,
  canManage,
  projectId,
  projectName,
  onClose,
}: ShareDialogProps) {
  const [owner, setOwner] = useState<ProjectOwnerSummary | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorSummary[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isActive = true;

    async function loadCollaborators() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/projects/${projectId}/collaborators`,
        );
        const data = await readJsonResponse<CollaboratorsResponse>(response);

        if (isActive) {
          setOwner(data.owner);
          setCollaborators(data.collaborators);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load collaborators.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadCollaborators();

    return () => {
      isActive = false;
    };
  }, [isOpen, projectId]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1600);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await readJsonResponse<CollaboratorMutationResponse>(
        response,
      );

      setCollaborators((current) => {
        if (current.some((c) => c.id === data.collaborator.id)) {
          return current;
        }

        return [...current, data.collaborator];
      });
      setEmail("");
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Unable to invite collaborator.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(collaboratorId: string) {
    setIsSubmitting(true);
    setError(null);

    try {
      await readJsonResponse<CollaboratorMutationResponse>(
        await fetch(
          `/api/projects/${projectId}/collaborators/${collaboratorId}`,
          { method: "DELETE" },
        ),
      );

      setCollaborators((current) =>
        current.filter((collaborator) => collaborator.id !== collaboratorId),
      );
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove collaborator.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
    toast.success("Copied!");
    setCopied(true);
  }

  const peopleWithAccess: PersonWithAccess[] = [
    ...(owner
      ? [
          {
            id: owner.id,
            email: owner.email,
            displayName: owner.displayName,
            imageUrl: owner.imageUrl,
            role: "Owner" as const,
          },
        ]
      : []),
    ...collaborators.map((collaborator) => ({
      id: collaborator.id,
      email: collaborator.email,
      displayName: collaborator.displayName,
      imageUrl: collaborator.imageUrl,
      role: "Collaborator" as const,
      collaboratorId: collaborator.id,
    })),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <EditorDialogContent
        title="Share Project"
        description={`Manage access for ${projectName}.`}
        className="sm:max-w-xl"
      >
        {canManage ? (
          <form className="flex gap-2" onSubmit={handleInvite}>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@example.com"
              className="text-copy-primary placeholder:text-copy-muted"
            />
            <Button type="submit" disabled={isSubmitting || !email.trim()}>
              <UserRoundPlus className="h-4 w-4" />
              Invite
            </Button>
          </form>
        ) : null}

        {canManage ? (
          <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-subtle/45 px-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-copy-primary">
                Project link
              </p>
              <p className="mt-1 truncate font-mono text-xs text-copy-muted">
                Current workspace URL
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        ) : null}

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-copy-primary">
              People with access
            </h3>
            {!canManage ? (
              <p className="mt-1 text-sm text-copy-muted">
                You can view project access, but only the owner can manage it.
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="rounded-2xl border border-state-error/40 bg-subtle px-3 py-2 text-sm text-state-error">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <p className="rounded-2xl border border-surface-border bg-subtle/45 px-3 py-4 text-center text-sm text-copy-muted">
              Loading collaborators...
            </p>
          ) : null}

          {!isLoading && peopleWithAccess.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-surface-border bg-subtle/45 px-3 py-6 text-center text-sm text-copy-muted">
              No access details available.
            </p>
          ) : null}

          {!isLoading && peopleWithAccess.length > 0 ? (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {peopleWithAccess.map((person) => (
                <div
                  key={`${person.role}-${person.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-surface-border bg-subtle/45 px-3 py-3"
                >
                  {person.imageUrl ? (
                    <Image
                      src={person.imageUrl}
                      alt=""
                      width={36}
                      height={36}
                      unoptimized
                      className="h-9 w-9 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-dim text-xs font-semibold text-brand">
                      {getInitials(person)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-copy-primary">
                      {person.displayName ?? person.email ?? person.id}
                    </p>
                    <p className="mt-1 truncate text-xs text-copy-muted">
                      {person.email ?? "Clerk user"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-xl border border-surface-border px-2 py-1 text-xs text-copy-muted">
                    {person.role}
                  </span>

                  {canManage && person.collaboratorId ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${person.email ?? person.id}`}
                      disabled={isSubmitting}
                      onClick={() => handleRemove(person.collaboratorId ?? "")}
                    >
                      <Trash2 className="h-4 w-4 text-state-error" />
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </EditorDialogContent>
    </Dialog>
  );
}
