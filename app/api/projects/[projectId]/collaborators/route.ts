import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import {
  enrichCollaborators,
  enrichProjectOwner,
  isValidCollaboratorEmail,
  normalizeCollaboratorEmail,
} from "@/lib/collaborators";
import { getAccessibleProject, getCurrentProjectIdentity } from "@/lib/project-access";
import { jsonError, parseJsonObject } from "@/lib/project-api";
import { prisma } from "@/lib/prisma";

interface ProjectCollaboratorsRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function GET(_request: Request, context: ProjectCollaboratorsRouteContext) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await context.params;
  const project = await getAccessibleProject(projectId, identity);

  if (!project) {
    return jsonError("Project not found.", 404);
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  return Response.json({
    owner: await enrichProjectOwner(project.ownerId),
    collaborators: await enrichCollaborators(collaborators),
    canManage: project.role === "owner",
  });
}

export async function POST(request: Request, context: ProjectCollaboratorsRouteContext) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await context.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return jsonError("Project not found.", 404);
  }

  if (project.ownerId !== userId) {
    return jsonError("Forbidden", 403);
  }

  const body = await parseJsonObject(request);

  if (!body || typeof body.email !== "string") {
    return jsonError("Collaborator email is required.", 400);
  }

  const email = normalizeCollaboratorEmail(body.email);

  if (!isValidCollaboratorEmail(email)) {
    return jsonError("Collaborator email is invalid.", 400);
  }

  const identity = await getCurrentProjectIdentity();

  if (identity?.primaryEmail && email === normalizeCollaboratorEmail(identity.primaryEmail)) {
    return jsonError("Project owner cannot be added as a collaborator.", 400);
  }

  try {
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        email,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    revalidatePath("/editor");
    revalidatePath(`/editor/${projectId}`);

    const [enrichedCollaborator] = await enrichCollaborators([collaborator]);

    return Response.json({ collaborator: enrichedCollaborator }, { status: 201 });
  } catch (error) {
    console.error("Error inviting collaborator:", error);
    return jsonError("Collaborator already has access.", 409);
  }
}
