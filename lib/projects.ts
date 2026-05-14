import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import type { ProjectSummary } from "@/types/project";

interface ProjectLists {
  ownedProjects: ProjectSummary[];
  sharedProjects: ProjectSummary[];
}

function toProjectSummary(
  project: { id: string; name: string },
  role: ProjectSummary["role"],
): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    role,
  };
}

export async function getCurrentUserProjectLists(): Promise<ProjectLists> {
  const user = await currentUser();

  if (!user) {
    return {
      ownedProjects: [],
      sharedProjects: [],
    };
  }

  const collaboratorEmails = user.emailAddresses.map(
    (emailAddress) => emailAddress.emailAddress,
  );

  const [ownedProjects, sharedProjects] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
      },
    }),
    collaboratorEmails.length > 0
      ? prisma.project.findMany({
          where: {
            ownerId: { not: user.id },
            collaborators: {
              some: {
                email: { in: collaboratorEmails },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
          },
        })
      : Promise.resolve([]),
  ]);

  return {
    ownedProjects: ownedProjects.map((project) =>
      toProjectSummary(project, "owner"),
    ),
    sharedProjects: sharedProjects.map((project) =>
      toProjectSummary(project, "collaborator"),
    ),
  };
}
