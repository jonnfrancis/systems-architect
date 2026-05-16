import { get, put } from "@vercel/blob";

import { isCanvasSnapshot } from "@/lib/canvas-snapshot";
import {
  getAccessibleProject,
  getCurrentProjectIdentity,
} from "@/lib/project-access";
import { jsonError } from "@/lib/project-api";
import { prisma } from "@/lib/prisma";

const MAX_CANVAS_REQUEST_BYTES = 1_000_000;

interface CanvasRequestJsonError {
  error: string;
  status: 400 | 413;
}

interface CanvasRequestJsonSuccess {
  body: unknown;
}

interface ProjectCanvasRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

function getSafeCanvasBlobReference(value: string, projectId: string) {
  const expectedPathname = `/canvas/${projectId}.json`;
  const expectedKey = `canvas/${projectId}.json`;

  if (value === expectedKey) {
    return value;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com") &&
      url.pathname === expectedPathname
    ) {
      return value;
    }
  } catch {
    return null;
  }

  return null;
}

async function readCanvasRequestJson(
  request: Request,
): Promise<CanvasRequestJsonError | CanvasRequestJsonSuccess> {
  const contentLength = request.headers.get("content-length");

  if (
    contentLength &&
    Number.isFinite(Number(contentLength)) &&
    Number(contentLength) > MAX_CANVAS_REQUEST_BYTES
  ) {
    return { error: "Canvas JSON is too large.", status: 413 } as const;
  }

  const text = await request.text();

  if (text.length > MAX_CANVAS_REQUEST_BYTES) {
    return { error: "Canvas JSON is too large.", status: 413 } as const;
  }

  try {
    return { body: JSON.parse(text) as unknown } as const;
  } catch {
    return {
      error: "Request body must be valid canvas JSON.",
      status: 400,
    } as const;
  }
}

async function readBlobJson(blobReference: string) {
  const result = await get(blobReference, {
    access: "private",
    useCache: false,
  });

  if (!result || result.statusCode !== 200) {
    return null;
  }

  return new Response(result.stream).json();
}

function isBlobNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "BlobNotFoundError"
  );
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

  const blobReference = getSafeCanvasBlobReference(
    canvasProject.canvasJsonPath,
    projectId,
  );

  if (!blobReference) {
    return jsonError("Saved canvas reference is invalid.", 500);
  }

  try {
    const canvas = await readBlobJson(blobReference);

    if (!canvas) {
      return Response.json({ canvas: null });
    }

    if (!isCanvasSnapshot(canvas)) {
      return jsonError("Saved canvas is invalid.", 500);
    }

    return Response.json({
      canvas,
      canvasJsonPath: canvasProject.canvasJsonPath,
    });
  } catch (error) {
    if (isBlobNotFoundError(error)) {
      return Response.json({ canvas: null });
    }

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

  const parsed = await readCanvasRequestJson(request);

  if ("error" in parsed) {
    return jsonError(parsed.error, parsed.status);
  }

  if (!isCanvasSnapshot(parsed.body)) {
    return jsonError("Request body must include canvas nodes and edges.", 400);
  }

  try {
    const blob = await put(
      `canvas/${projectId}.json`,
      JSON.stringify(parsed.body),
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
