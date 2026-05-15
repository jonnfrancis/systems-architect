# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor canvas visual fixes complete

## Current Goal

- Ready to build the next feature unit.

## Completed

- Feature spec 01 design system foundation:
  - Installed `lucide-react` and shadcn UI support dependencies.
  - Added shadcn configuration in `components.json`.
  - Added required UI primitives: Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea.
  - Added `lib/utils.ts` with reusable `cn()` helper.
  - Added dark-only theme tokens and Tailwind mappings in `app/globals.css`.
- Feature spec 02 editor chrome:
  - Added fixed top editor navbar with left, center, and empty right sections.
  - Added sidebar toggle using `PanelLeftOpen` and `PanelLeftClose`.
  - Added floating project sidebar shell with header, close action, tabs, empty states, and full-width `New Project` button.
  - Added reusable editor dialog content pattern with title, description, body, and footer support.
  - Mounted the editor chrome on the home page through a small client shell.
- Feature spec 03 auth:
  - Installed `@clerk/ui`.
  - Wrapped the root layout with `ClerkProvider` using Clerk dark theme and app CSS variables.
  - Added sign-in and sign-up routes with minimal two-panel desktop layout and form-only mobile layout.
  - Added root `proxy.ts` with public auth routes and default protection for everything else.
  - Updated `/` to redirect authenticated users to `/editor` and unauthenticated users to `/sign-in`.
  - Added protected `/editor` route and Clerk `UserButton` in the editor navbar.
  - Added official Clerk sign-in/sign-up URL env vars.
- Feature spec 04 project dialogs:
  - Added minimal `/editor` home content with heading, description, and `New Project` button.
  - Added create, rename, and delete project dialogs.
  - Added live slug preview for project name forms.
  - Added dedicated hook for dialog, form, mock project, and loading state.
  - Wired sidebar create, rename, and delete actions using mock project data.
  - Hid project actions for shared/collaborator projects.
  - Added mobile sidebar backdrop scrim with outside-tap close behavior.
- Feature spec 05 Prisma:
  - Added `Project` and `ProjectCollaborator` models with `ProjectStatus`.
  - Added required relations, cascade delete, indexes, and unique project/email collaborator constraint.
  - Added cached Prisma singleton in `lib/prisma.ts`.
  - Ran first migration: `20260514092828_init`.
  - Generated Prisma Client.
- Feature spec 06 project APIs:
  - Added `GET /api/projects` for listing the authenticated user's owned projects.
  - Added `POST /api/projects` for creating projects with Clerk `userId` as `ownerId` and `Untitled Project` fallback naming.
  - Added `PATCH /api/projects/[projectId]` for owner-only project renames.
  - Added `DELETE /api/projects/[projectId]` for owner-only project deletion.
  - Added consistent JSON error responses for unauthenticated, forbidden, missing, and invalid requests.
- Feature spec 07 wire editor home:
  - Added server-side project list loading for owned and shared projects.
  - Added API-backed `useProjectActions` hook for create, rename, and delete dialogs.
  - Wired the editor home shell, sidebar, and project dialogs to real project data.
  - Added room ID preview and create navigation to `/editor/{projectId}`.
  - Added owner rename/delete refresh behavior and active workspace delete redirect behavior.
  - Updated project creation to accept a validated slug-based project ID so project ID and room ID stay aligned.
- Feature spec 08 editor workspace shell:
  - Added `/editor/[roomId]` as a server component with project access checks.
  - Added `lib/project-access.ts` for current Clerk identity and owner/collaborator project access resolution.
  - Added `AccessDenied` for missing or unauthorized projects.
  - Added workspace chrome with project-name navbar, share button, AI sidebar toggle, existing project sidebar, canvas placeholder, and AI chat placeholder.
  - Highlighted the active room in the project sidebar, including shared-project tab selection.
- Feature spec 09 share dialog:
  - Added collaborator list, invite, and remove API routes.
  - Enforced owner-only invite and remove behavior server-side.
  - Enriched collaborator emails with Clerk display names and avatar images when available.
  - Added enriched project owner data to the share API response.
  - Wired the workspace Share button to a dialog with owner-managed and collaborator read-only states.
  - Added a People with access section that shows the owner and collaborators.
  - Added project link copy behavior with temporary `Copied!` feedback.
- Feature spec 10 Liveblocks setup:
  - Added `@liveblocks/node` for server-side Liveblocks auth.
  - Configured `liveblocks.config.ts` with shared presence and user metadata types.
  - Added a cached Liveblocks node client in `lib/liveblocks.ts`.
  - Added deterministic cursor color assignment from a fixed palette.
  - Added `POST /api/liveblocks-auth` with Clerk authentication and project access checks.
  - Ensured Liveblocks rooms are created only when missing, using project IDs as room IDs.
  - Attached Clerk user name, avatar URL, and generated cursor color to session metadata.
- Feature spec 11 base canvas:
  - Added shared canvas node, edge, color, and shape types in `types/canvas.ts`.
  - Typed Liveblocks storage with the React Flow-backed `flow` state.
  - Added a client canvas wrapper with `LiveblocksProvider`, `RoomProvider`, initial presence, `ClientSideSuspense`, and Liveblocks error fallback.
  - Replaced the workspace canvas placeholder with a Liveblocks-synced React Flow canvas.
  - Wired `useLiveblocksFlow` with empty initial nodes and edges.
  - Added loose connections, `fitView`, `MiniMap`, and dot-pattern canvas background.
- Feature spec 12 shape panel:
  - Added a floating bottom-center draggable shape toolbar.
  - Added draggable buttons for rectangle, diamond, circle, pill, cylinder, and hexagon shapes.
  - Added typed drag payloads with shape and default size data.
  - Added canvas dragover/drop handling that converts screen coordinates through React Flow.
  - Added collaborative node creation using the existing Liveblocks-synced node change handler.
  - Added a basic custom `canvasNode` renderer so dropped nodes are visible.
- Editor canvas visual review:
  - Documented the current canvas visual issues in `context/current-issues.md`.
  - Updated `CanvasNodeRenderer` to render rectangle, circle, pill, diamond, cylinder, and hexagon nodes based on `data.shape`.
  - Added hover-revealed connection handles to custom canvas nodes.
  - Updated the workspace layout so the AI sidebar floats above the full-width canvas instead of shrinking it.
  - Kept the dotted React Flow canvas visible edge-to-edge behind both floating sidebars.
  - Normalized the Liveblocks auth room ID and used the same value for access checks, room creation, and session permissions.
  - Scoped React Flow and Liveblocks Flow CSS imports to the editor route segment.

## In Progress

- None yet.

## Next Up

- Feature spec 13 node shape rendering.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Feature 07 keeps project IDs and Liveblocks room IDs aligned by creating projects with a validated slug-plus-suffix ID generated from the project name.

## Session Notes

- Started implementation of `context/feature-specs/01-design-system.md`.
- Added shadcn-style configuration, required UI primitives, lucide-react dependencies, dark theme tokens, and `cn()` helper.
- `npm.cmd run lint` passed with elevated workspace access. `npm.cmd run build` and direct `tsc` were blocked in the sandbox by OneDrive path access; build escalation was declined.
- Started implementation of `context/feature-specs/02-editor-chrome.md`.
- Added editor navbar, floating project sidebar shell, reusable editor dialog content pattern, and mounted the editor shell on `app/page.tsx`.
- Verification note for feature 02: sandboxed lint/build commands are blocked by OneDrive path access. Elevated lint timed out once, and longer lint/build escalation was declined.
- Started implementation of `context/feature-specs/03-auth.md`.
- Added Clerk URL env vars, shared auth route constants, Clerk appearance config, auth page shell, sign-in/sign-up routes, protected editor route, root redirect, proxy route protection, and editor navbar `UserButton`.
- Verification for feature 03: `npm.cmd run lint` passed and `tsc --noEmit` passed. `npm.cmd run build` reached Next's production build but failed while fetching Geist fonts from Google; the elevated network build request was declined.
- Started implementation of `context/feature-specs/04-project-dialogs.md`.
- Added editor home CTA, mock project state hook, project dialogs, owner-only sidebar actions, and mobile sidebar scrim.
- Verification for feature 04: `tsc --noEmit` passed and `npm.cmd run lint` passed.
- Started implementation of `context/feature-specs/05-prisma.md`.
- Added `prisma/models/project.prisma` and `lib/prisma.ts` with Prisma Postgres/Accelerate and direct Postgres branching.
- Ran `prisma format`, `prisma validate`, `prisma migrate dev --name init`, and `prisma generate`.
- Verification for feature 05: `tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` passed. Build required elevated network access to fetch Next Google fonts.
- Started and completed implementation of `context/feature-specs/06-project-apis.md`.
- Added backend-only project REST route handlers and shared project API helpers.
- Updated `proxy.ts` so `/api/projects` handlers return their own JSON `401` responses while still enforcing Clerk auth inside each handler.
- Verification for feature 06: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` passed. Build required elevated network access to fetch Next Google fonts.
- Started and completed implementation of `context/feature-specs/07-wire-editor-home.md`.
- Replaced mock project dialog state with API-backed project actions and server-fetched editor project lists.
- Updated create flow to generate a room ID, persist it as the project ID, and navigate to `/editor/{projectId}`.
- Verification for feature 07: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` passed. Build required elevated network access to fetch Next Google fonts.
- Started and completed implementation of `context/feature-specs/08-editor-workspace-shell.md`.
- Added `/editor/[roomId]`, project access helpers, `AccessDenied`, active sidebar highlighting, and placeholder workspace chrome.
- Verification for feature 08: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and `npm.cmd run build` passed. Build required elevated network access to fetch Next Google fonts.
- Re-verified feature 08 after interrupted work: `/editor/[roomId]` server access checks, workspace shell wiring, active project sidebar state, and `AccessDenied` remain implemented. `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and elevated `npm.cmd run build` passed.
- Started and completed implementation of `context/feature-specs/09-share-dialog.md`.
- Added share dialog APIs for listing, inviting, and removing project collaborators, with owner-only mutations enforced server-side.
- Added Clerk enrichment for collaborator names and avatars, plus owner enrichment for the People with access section.
- Wired the workspace Share button to the owner-managed/read-only dialog, collaborator removal, and project link copy feedback.
- Verification for feature 09: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and elevated `npm.cmd run build` passed. The sandboxed build failed only because Next could not fetch Google Fonts without network access.
- Started and completed implementation of `context/feature-specs/10-liveblocks-setup.md`.
- Installed the official `@liveblocks/node` package after confirming the server-side node client dependency was missing.
- Added Liveblocks presence/user metadata types, cached client helper, deterministic cursor colors, and the authenticated room token route.
- Verification for feature 10: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and elevated `npm.cmd run build` passed. The sandboxed build failed only because Next could not fetch Google Fonts without network access.
- Started and completed implementation of `context/feature-specs/11-base-canvas.md`.
- Added the Liveblocks-backed React Flow canvas wrapper and shared canvas types, keeping `/editor/[roomId]` server-side.
- Verification for feature 11: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and elevated `npm.cmd run build` passed. The sandboxed build failed only because Next could not fetch Google Fonts without network access.
- Started and completed implementation of `context/feature-specs/12-shape-panel.md`.
- Added draggable shape payloads, bottom shape panel, drop-to-create behavior, and a simple custom canvas node renderer.
- Verification for feature 12: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, and elevated `npm.cmd run build` passed. The sandboxed build failed only because Next could not fetch Google Fonts without network access.
- Completed editor canvas visual review and fixes from `context/current-issues.md`.
- Added per-shape canvas node rendering, floating AI sidebar behavior, full-width canvas treatment, normalized Liveblocks auth room IDs, and editor-scoped React Flow CSS imports.
- Verification for canvas visual fixes: `npx.cmd next typegen`, `npx.cmd tsc --noEmit --incremental false`, `npm.cmd run lint`, and elevated `npm.cmd run build` passed. The sandboxed build failed only because Next could not fetch Google Fonts without network access.
