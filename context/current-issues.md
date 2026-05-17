# Editor Canvas Review

## Findings

- Dropped canvas nodes preserved `data.shape`, but `CanvasNodeRenderer` ignored it and rendered every node with one rounded rectangle surface.
- Complex shapes defined by the UI context (`diamond`, `cylinder`, `hexagon`) needed SVG rendering rather than CSS-only rounded boxes.
- The AI sidebar was part of the workspace flex layout, so opening it reduced the canvas width instead of floating above the canvas.
- The canvas was wrapped in a flex child, which prevented the dotted React Flow background from reading as an edge-to-edge design surface behind the right panel.
- The left project sidebar already floated, but the right sidebar needed matching elevated panel treatment and hidden-state behavior.
- The Liveblocks auth route parsed `roomId` directly from the request, then used `project.id` for room creation and session permission. Since project IDs and room IDs are intended to stay aligned, the route should normalize once and use the same value for access, room creation, and `session.allow`.
- React Flow and Liveblocks Flow styles were imported in the root app layout, making editor-only canvas styles global.

## Fixes Applied

- `CanvasNodeRenderer` now renders `rectangle`, `circle`, and `pill` as CSS surfaces and `diamond`, `cylinder`, and `hexagon` as inline SVG surfaces.
- Canvas nodes now reveal connection handles on hover at the four cardinal sides.
- Dropped shapes are centered under the cursor and keep the panel-provided dimensions.
- The React Flow canvas fills the full editor workspace with dot-pattern background, scroll panning, selection drag, minimap, and Liveblocks cursors.
- The AI sidebar is now a fixed floating panel with elevated background, border, blur, and shadow. When toggled off, it slides fully out of view and is removed from interaction.
- The canvas now remains full width behind both sidebars.
- `/api/liveblocks-auth` trims and validates the requested room ID once, then uses that same `roomId` for `getAccessibleProject`, `ensureLiveblocksRoom`, and `session.allow`.
- React Flow and Liveblocks Flow CSS imports moved from `app/layout.tsx` into the editor route segment layout.

## Verification

- `npx.cmd next typegen` passed.
- `npx.cmd tsc --noEmit --incremental false` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed with elevated network access for Google Fonts.

## Node Editing Bug Review

### Findings

- The inline label overlay introduced for node editing used full-node `nodrag` and `nopan` classes in read mode. Because that overlay covered the node, pointer interactions from the label area no longer reached React Flow's node drag behavior.
- Label editing updated collaborative node data on every keystroke, which could create unnecessary Liveblocks/React Flow churn during typing.
- The shape drag preview depended primarily on drag events completing normally, which left room for a stuck preview if a drag was interrupted by focus loss, a page visibility change, or a drop outside the expected target.
- Preview movement updated React state on every `dragover`, creating more renders than needed during drag.
- The preview was positioned directly with viewport `left`/`top` values instead of using a stable overlay coordinate space.
- `NodeResizer.color` received node text color directly without validating that the value was safe to hand to CSS.

### Fixes Applied

- Removed the read-mode label overlay's drag-blocking behavior so nodes can be dragged from the label/center area again.
- Kept drag and pan prevention limited to the active textarea while editing.
- Debounced label data updates and flushed the latest draft value on blur or `Escape`.
- Added CSS color validation/fallback before passing color into `NodeResizer`.
- Added reliable drag preview cleanup from source `onDragEnd`, canvas drop, window drop, blur, visibility changes, and component unmount.
- Throttled preview position updates through `requestAnimationFrame`.
- Rendered the ghost preview inside a fixed viewport overlay and positioned it with overlay-relative transforms.

### Verification

- `npx.cmd tsc --noEmit --incremental false` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed with elevated network access for Google Fonts.

## Canvas Template And Label Bug Review

### Findings

- `handleConnect` built a new edge through `addEdge(..., [])`, so duplicate connection IDs could be generated because the current edge set was not part of ID creation.
- Starter template import deleted and added nodes/edges through separate change batches derived from render-time snapshots, making replacement vulnerable to stale state under collaboration.
- Edge label editing kept an independent `draftLabel` initialized from the original label, so remote label changes could be overwritten when editing reopened or saved from stale local state.
- Node label commits accepted raw whitespace while edge labels trimmed user input, allowing whitespace-only node labels and inconsistent label behavior.
- Template previews resolved each edge endpoint with repeated `template.nodes.find(...)` calls.

### Fixes

- Generated connection edge IDs explicitly from source, target, handles, and existing edge IDs before adding the edge.
- Replaced starter template import with a single Liveblocks storage mutation that swaps the whole React Flow-backed `flow` object.
- Rendered edge label input text from the live collaborative label whenever the edge is not actively being edited.
- Normalized node and edge label commits by trimming and collapsing whitespace.
- Added a memoized `nodeId -> node` map for starter template preview edge rendering.

### Verification

- `npx.cmd tsc --noEmit --incremental false` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed with elevated network access for Google Fonts.


### 1. Delete Nodese and Edges
REad Liveblocks agent skills before implementing this. Then read the canvas wrapper component and the existing node and edge mutation helpers.
Selected nodes and edges cannot be delete from the canvas

Add a keydown event listener to the canvas wrapper that:
-Listens for Delete and Backspace keys
-does not fire when the event target is an input, textarea or contenteditable element
-gets currently selected nodes using useNodes filtered by selected state
- removes the using the existing Liveblocks collaborative mutation helpers

Do not use React Flow's built-in deleteKeyCode or any React Flow keyboard deletion behaviour. All deletions must go through the existing Liveblocks collaborative state so they sync across all connected clients in real time.
Do not change anything else

### 2. Node Connection Handles
Read liveblocks agent skills before implementing this. Nodes can only be connected from the top handle. All four handles - top, right, bottom, left - should be active and connectable. Check the existing Handle components in the custom node renderer. Verify each handle as the correct position prop and that no CSS is hiding or disabling the non-top handles. Connection between any two handles on any two nodes should work and sync through the existing Liveblocks edge state.

### 3. Collaborator Avatar Image Error
Check Clerk agent skills before implementing this.
Add img.clerk.com to the allowed image hostnames in next.config.ts using the correct remotePatterns configuration.

### 4. Potential Bugs & Fixes
- Harden canvasJsonPath handling: validate/allowlist blob URL or key before calling @vercel/blob get()
- Add request size limits and stricter snapshot validation (node/edge counts and field sizes) for canvas autosave PUT
- Audit and update all Liveblocks presence usage to match the new `thinking` field (or add backward-compatible mapping)
- Align runtime/CI Node version to >=20 or replace @vercel/blob with a compatible alternative
- Update saved canvas loader to treat 404 as a normal empty state and avoid error logging
- Fix type mismatch between CanvasTemplate and CanvasSnapshot when creating Liveblocks flow storage
- Strengthen canvas snapshot validation to ensure required React Flow node/edge fields exist before saving/loading
- Throttle Liveblocks cursor presence updates to reduce network chatter

## scope
- fix only what is listed above
- Do not change canvas node or edge rendering behaviour
- Do not break existing autosave, presence, or collaboration logic
- npm run build passes

## Liveblocks Auth HTML Unauthorized Review

### Findings

- The browser error shows Liveblocks receiving an HTML document from its auth request instead of a Liveblocks auth response.
- `CanvasWorkspace` configures `LiveblocksProvider` with `authEndpoint="/api/liveblocks-auth"`, so every canvas room join depends on that endpoint returning the expected Liveblocks token response.
- `app/api/liveblocks-auth/route.ts` already performs the correct project membership checks and returns JSON-style errors for unauthenticated or forbidden access.
- `proxy.ts` currently marks only `/api/projects(.*)` as a self-authenticated API route. Because `/api/liveblocks-auth` is not included, Clerk middleware can protect/intercept the auth POST before the Liveblocks route handler runs.
- When Clerk middleware intercepts that request, the response can be an HTML sign-in/error page. Liveblocks then reports `Liveblocks Unauthorized: <!DOCTYPE html>...`, and the canvas fails because `RoomProvider` cannot authorize the room.
- A second possible issue is opening a literal or inaccessible route such as `/editor/editorId`. If `editorId` is not an accessible project ID, the Liveblocks auth route should return a `403` from `getAccessibleProject`. That would still block the canvas, but it should be a JSON failure rather than the pasted HTML body.

### Suggested Fix

- Add `/api/liveblocks-auth` to `selfAuthenticatedApiRoutes` in `proxy.ts`, matching the existing `/api/projects(.*)` pattern.
- Keep authentication and project access enforcement inside `app/api/liveblocks-auth/route.ts`, where the route can return predictable `401`, `403`, or Liveblocks authorization responses.
- Verify that `/editor/[roomId]` is opened with an actual project ID that the signed-in user owns or collaborates on.

### Verification Plan

- While signed in, open a real `/editor/{projectId}` workspace and confirm `POST /api/liveblocks-auth` no longer returns `text/html`.
- Confirm the same request returns a Liveblocks authorization response for accessible projects.
- Confirm unauthenticated access returns the route handler's JSON `401` response.
- Confirm inaccessible project IDs return the route handler's JSON `403` response.

## Canvas Autosave 400 Review

### Findings

- The failing request is `PUT /api/projects/ghost-ai-system-316i17/canvas`, and the route returns `400`, which means the request reached application code and was rejected before Vercel Blob persistence.
- `hooks/use-canvas-autosave.ts` posts the serialized output of `createCanvasSnapshot(nodes, edges)` directly to the canvas route.
- `app/api/projects/[projectId]/canvas/route.ts` returns `400` when the request body is invalid JSON or when `isCanvasSnapshot(parsed.body)` rejects the snapshot.
- The hook currently throws a generic `Canvas save failed.` error without reading the route response body, so the browser console hides the exact validation message from the API.
- The most likely schema mismatch is in optional React Flow edge handle fields. `handleConnect` stores `connection.sourceHandle` and `connection.targetHandle` directly, and React Flow connection handle values can be `string | null`. The hardened snapshot validator accepts `undefined` or `string`, but not `null`, through `isValidOptionalString`.
- If an edge contains `sourceHandle: null` or `targetHandle: null`, `isCanvasSnapshot` rejects the whole canvas and the API returns `400`.

### Suggested Fix

- Normalize edge handles before saving or before edge creation so optional React Flow handle fields are omitted instead of persisted as `null`.
- The smallest source fix is in `handleConnect`: assign `sourceHandle: connection.sourceHandle ?? undefined` and `targetHandle: connection.targetHandle ?? undefined`.
- Also consider making the validator backward-compatible by accepting `null` for optional handle fields, because already-synced Liveblocks state or old saved snapshots may contain `null`.
- Update `useCanvasAutosave` to read the API error response and include its `error` message in the thrown error. That would make future autosave failures identify the rejected field instead of only logging a generic failure.

### Verification Plan

- Create two nodes, connect them, wait for autosave, and confirm `PUT /api/projects/{projectId}/canvas` returns `200`.
- Repeat with imported starter templates and with manually-created edges.
- Confirm DevTools request payload does not include `sourceHandle: null` or `targetHandle: null`, or confirm the validator intentionally accepts those values.
- Confirm the browser console shows the server-provided error message if the API still returns a non-OK response.

### Fix Applied

- Updated new canvas edge creation to omit missing handles instead of storing `null` values.
- Updated `createCanvasSnapshot` to normalize autosave payloads, including converting existing non-string handle values to omitted optional fields before the request is sent.
- Kept the API validator backward-compatible with existing Liveblocks or saved canvas state that may already contain `null` handle fields.
- Preserved strict route-level snapshot validation so malformed canvas bodies are still rejected before Blob persistence.
