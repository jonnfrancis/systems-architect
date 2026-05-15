import { prisma } from "@/lib/prisma";

export const defaultProjectName = "Untitled Project";

export const projectSelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  status: true,
  canvasJsonPath: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export function isValidProjectId(value: string) {
  return /^[a-z0-9][a-z0-9-]{2,79}$/.test(value);
}

export async function parseJsonObject(request: Request) {
  try {
    const text = await request.text();

    if (text.trim().length === 0) {
      return null;
    }

    const body: unknown = JSON.parse(text);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function findProjectOwner(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
}

export function validateSameOrigin(request: Request) {
  try {
    const expectedOrigin = new URL(request.url).origin;

    const origin = request.headers.get("origin");
    if (origin) {
      return origin === expectedOrigin;
    }

    const referer = request.headers.get("referer");
    if (referer) {
      return new URL(referer).origin === expectedOrigin;
    }

    return false;
  } catch (error) {
    console.error("Error validating origin/referer:", error);
    return false;
  }
}
