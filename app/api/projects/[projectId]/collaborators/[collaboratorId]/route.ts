import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { jsonError } from "@/lib/project-api";
import { prisma } from "@/lib/prisma";

interface ProjectCollaboratorRouteContext {
  params: Promise<{
    projectId: string;
    collaboratorId: string;
  }>;
}

export async function DELETE(
  _request: Request,
  context: ProjectCollaboratorRouteContext,
) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId, collaboratorId } = await context.params;
  const collaborator = await prisma.projectCollaborator.findUnique({
    where: { id: collaboratorId },
    select: {
      id: true,
      projectId: true,
      email: true,
      createdAt: true,
      project: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!collaborator || collaborator.projectId !== projectId) {
    return jsonError("Collaborator not found.", 404);
  }

  if (collaborator.project.ownerId !== userId) {
    return jsonError("Forbidden", 403);
  }

  const removedCollaborator = await prisma.projectCollaborator.delete({
    where: { id: collaboratorId },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  revalidatePath("/editor");
  revalidatePath(`/editor/${projectId}`);

  return Response.json({
    collaborator: {
      ...removedCollaborator,
      createdAt: removedCollaborator.createdAt.toISOString(),
    },
  });
}
