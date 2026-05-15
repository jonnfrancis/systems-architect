import { clerkClient } from "@clerk/nextjs/server";

import type {
  CollaboratorSummary,
  ProjectOwnerSummary,
} from "@/types/collaborator";

interface CollaboratorRecord {
  id: string;
  email: string;
  createdAt: Date;
}

function getUserDisplayName(user: {
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}) {
  const name = user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" ");

  return name.trim() || user.username || null;
}

export function normalizeCollaboratorEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidCollaboratorEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function enrichProjectOwner(
  ownerId: string,
): Promise<ProjectOwnerSummary> {
  const client = await clerkClient();

  try {
    const user = await client.users.getUser(ownerId);

    return {
      id: ownerId,
      email: user.primaryEmailAddress?.emailAddress ?? null,
      displayName: getUserDisplayName(user),
      imageUrl: user.imageUrl ?? null,
    };
  } catch (error) {
    console.error("Error enriching project owner:", error);

    return {
      id: ownerId,
      email: null,
      displayName: null,
      imageUrl: null,
    };
  }
}

export async function enrichCollaborators(
  collaborators: CollaboratorRecord[],
): Promise<CollaboratorSummary[]> {
  if (collaborators.length === 0) {
    return [];
  }

  const emails = collaborators.map((collaborator) => collaborator.email);
  const client = await clerkClient();
  const users = await client.users.getUserList({
    emailAddress: emails,
    limit: Math.min(emails.length, 500),
  });
  const usersByEmail = new Map(
    users.data.flatMap((user) =>
      user.emailAddresses.map((emailAddress) => [
        normalizeCollaboratorEmail(emailAddress.emailAddress),
        user,
      ]),
    ),
  );

  return collaborators.map((collaborator) => {
    const user = usersByEmail.get(normalizeCollaboratorEmail(collaborator.email));

    return {
      id: collaborator.id,
      email: collaborator.email,
      displayName: user ? getUserDisplayName(user) : null,
      imageUrl: user?.imageUrl ?? null,
      createdAt: collaborator.createdAt.toISOString(),
    };
  });
}
