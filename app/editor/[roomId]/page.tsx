import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { WorkspaceShell } from "@/components/editor/workspace-shell";
import { signInPath } from "@/lib/auth-routes";
import {
  getAccessibleProject,
  getCurrentProjectIdentity,
} from "@/lib/project-access";
import { getCurrentUserProjectLists } from "@/lib/projects";

interface EditorWorkspacePageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function EditorWorkspacePage({
  params,
}: EditorWorkspacePageProps) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    redirect(signInPath);
  }

  const { roomId } = await params;
  const [project, projectLists] = await Promise.all([
    getAccessibleProject(roomId, identity),
    getCurrentUserProjectLists(),
  ]);

  if (!project) {
    return <AccessDenied />;
  }

  return (
    <WorkspaceShell
      project={{
        id: project.id,
        name: project.name,
        role: project.role,
      }}
      {...projectLists}
    />
  );
}
