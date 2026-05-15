import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface ProjectIdentity {
  userId: string;
  primaryEmail: string | null;
}

export interface AccessibleProject {
  id: string;
  name: string;
  ownerId: string;
  role: "owner" | "collaborator";
}

export async function getCurrentProjectIdentity(): Promise<ProjectIdentity | null> {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return null;
  }

  const user = await currentUser();

  return {
    userId,
    primaryEmail: user?.primaryEmailAddress?.emailAddress ?? null,
  };
}

export async function getAccessibleProject(
  projectId: string,
  identity: ProjectIdentity,
): Promise<AccessibleProject | null> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: identity.userId },
        ...(identity.primaryEmail
          ? [
              {
                collaborators: {
                  some: {
                    email: identity.primaryEmail,
                  },
                },
              },
            ]
          : []),
      ],
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  });

  if (!project) {
    return null;
  }

  return {
    ...project,
    role: project.ownerId === identity.userId ? "owner" : "collaborator",
  };
}
