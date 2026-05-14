import { auth } from "@clerk/nextjs/server";

import {
  defaultProjectName,
  isValidProjectId,
  jsonError,
  parseJsonObject,
  projectSelect,
} from "@/lib/project-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: projectSelect,
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const body = await parseJsonObject(request);

  if (!body) {
    return jsonError("Request body must be a JSON object.", 400);
  }

  if ("name" in body && typeof body.name !== "string") {
    return jsonError("Project name must be a string.", 400);
  }

  if ("id" in body && typeof body.id !== "string") {
    return jsonError("Project ID must be a string.", 400);
  }

  if (
    typeof body.id === "string" &&
    (!body.id.trim() || !isValidProjectId(body.id.trim()))
  ) {
    return jsonError("Project ID is invalid.", 400);
  }

  const name =
    typeof body?.name === "string" && body.name.trim().length > 0
      ? body.name.trim()
      : defaultProjectName;
  const projectId =
    typeof body.id === "string" ? body.id.trim() : undefined;

  const project = await prisma.project.create({
    data: {
      id: projectId,
      ownerId: userId,
      name,
    },
    select: projectSelect,
  });

  return Response.json({ project }, { status: 201 });
}
