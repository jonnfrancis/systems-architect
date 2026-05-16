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

## scope
- fix only what is listed above
- Do not change canvas node or edge rendering behaviour
- Do not break existing autosave, presence, or collaboration logic
- npm run build passes
