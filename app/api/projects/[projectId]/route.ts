import { auth } from "@clerk/nextjs/server";

import {
  findProjectOwner,
  jsonError,
  parseJsonObject,
  projectSelect,
} from "@/lib/project-api";
import { prisma } from "@/lib/prisma";

interface ProjectRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await context.params;
  const owner = await findProjectOwner(projectId);

  if (!owner) {
    return jsonError("Project not found.", 404);
  }

  if (owner.ownerId !== userId) {
    return jsonError("Forbidden", 403);
  }

  const body = await parseJsonObject(request);

  if (!body || typeof body.name !== "string" || body.name.trim().length === 0) {
    return jsonError("Project name is required.", 400);
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name: body.name.trim() },
    select: projectSelect,
  });

  return Response.json({ project });
}

export async function DELETE(_request: Request, context: ProjectRouteContext) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await context.params;
  const owner = await findProjectOwner(projectId);

  if (!owner) {
    return jsonError("Project not found.", 404);
  }

  if (owner.ownerId !== userId) {
    return jsonError("Forbidden", 403);
  }

  const project = await prisma.project.delete({
    where: { id: projectId },
    select: projectSelect,
  });

  return Response.json({ project });
}
