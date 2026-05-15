import { currentUser } from "@clerk/nextjs/server";

import {
  ensureLiveblocksRoom,
  getCursorColorForUser,
  getLiveblocksClient,
} from "@/lib/liveblocks";
import {
  getAccessibleProject,
  getCurrentProjectIdentity,
} from "@/lib/project-access";
import { jsonError, parseJsonObject } from "@/lib/project-api";

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) {
    return null;
  }

  const name =
    user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" ");

  return (
    name.trim() ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    null
  );
}

function getRequestedRoomId(body: Record<string, unknown> | null) {
  const requestedRoomId =
    typeof body?.room === "string"
      ? body.room
      : typeof body?.roomId === "string"
        ? body.roomId
        : null;

  const roomId = requestedRoomId?.trim();

  return roomId || null;
}

export async function POST(request: Request) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return jsonError("Unauthorized", 401);
  }

  const body = await parseJsonObject(request);
  const roomId = getRequestedRoomId(body);

  if (!roomId) {
    return jsonError("Liveblocks room is required.", 400);
  }

  const project = await getAccessibleProject(roomId, identity);

  if (!project) {
    return jsonError("Forbidden", 403);
  }

  const user = await currentUser();
  const liveblocks = getLiveblocksClient();
  const cursorColor = getCursorColorForUser(identity.userId);

  await ensureLiveblocksRoom(roomId);

  const session = liveblocks.prepareSession(identity.userId, {
    userInfo: {
      name: getDisplayName(user) ?? identity.userId,
      avatarUrl: user?.imageUrl ?? null,
      cursorColor,
    },
  });

  session.allow(roomId, session.FULL_ACCESS);

  const { body: responseBody, status } = await session.authorize();

  return new Response(responseBody, { status });
}
