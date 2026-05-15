import { Liveblocks, LiveblocksError } from "@liveblocks/node";

const cursorColors = [
  "#00c8d4",
  "#6457f9",
  "#34d399",
  "#fbbf24",
  "#ff4d4f",
  "#8b82ff",
  "#0ac7b4",
  "#f75f8f",
] as const;

let liveblocksClient: Liveblocks | null = null;

export function getCursorColorForUser(userId: string) {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  return cursorColors[hash % cursorColors.length];
}

export function getLiveblocksClient() {
  if (liveblocksClient) {
    return liveblocksClient;
  }

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not configured.");
  }

  liveblocksClient = new Liveblocks({ secret });

  return liveblocksClient;
}

export async function ensureLiveblocksRoom(roomId: string) {
  const liveblocks = getLiveblocksClient();

  try {
    await liveblocks.getRoom(roomId);
  } catch (error) {
    if (error instanceof LiveblocksError && error.status === 404) {
      try {
        await liveblocks.createRoom(roomId, {
          defaultAccesses: [],
          metadata: {
            projectId: roomId,
          },
        });
      } catch (createError) {
        if (
          createError instanceof LiveblocksError &&
          createError.status === 409
        ) {
          return;
        }

        throw createError;
      }
      return;
    }

    throw error;
  }
}
