import { get, put } from "@vercel/blob";

import { isCanvasSnapshot } from "@/lib/canvas-snapshot";
import {
  getAccessibleProject,
  getCurrentProjectIdentity,
} from "@/lib/project-access";
import { jsonError } from "@/lib/project-api";
import { prisma } from "@/lib/prisma";

interface ProjectCanvasRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

async function readBlobJson(url: string) {
  const result = await get(url, {
    access: "private",
    useCache: false,
  });

  if (!result || result.statusCode !== 200) {
    return null;
  }

  return new Response(result.stream).json();
}

export async function GET(
  _request: Request,
  context: ProjectCanvasRouteContext,
) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await context.params;
  const project = await getAccessibleProject(projectId, identity);

  if (!project) {
    return jsonError("Project not found.", 404);
  }

  const canvasProject = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  });

  if (!canvasProject?.canvasJsonPath) {
    return Response.json({ canvas: null });
  }

  try {
    const canvas = await readBlobJson(canvasProject.canvasJsonPath);

    if (!canvas) {
      return jsonError("Saved canvas not found.", 404);
    }

    if (!isCanvasSnapshot(canvas)) {
      return jsonError("Saved canvas is invalid.", 500);
    }

    return Response.json({
      canvas,
      canvasJsonPath: canvasProject.canvasJsonPath,
    });
  } catch (error) {
    console.error("Error loading canvas:", error);
    return jsonError("Failed to load canvas.", 500);
  }
}

export async function PUT(
  request: Request,
  context: ProjectCanvasRouteContext,
) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await context.params;
  const project = await getAccessibleProject(projectId, identity);

  if (!project) {
    return jsonError("Project not found.", 404);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Request body must be valid canvas JSON.", 400);
  }

  if (!isCanvasSnapshot(body)) {
    return jsonError("Request body must include canvas nodes and edges.", 400);
  }

  try {
    const blob = await put(
      `canvas/${projectId}.json`,
      JSON.stringify(body),
      {
        access: "private",
        allowOverwrite: true,
        contentType: "application/json",
      },
    );

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
      select: { id: true },
    });

    return Response.json({
      canvasJsonPath: blob.url,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving canvas:", error);
    return jsonError("Failed to save canvas.", 500);
  }
}
