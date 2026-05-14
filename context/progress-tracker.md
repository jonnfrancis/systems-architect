# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor home project API wiring complete

## Current Goal

- Ready to build the `/editor/[roomId]` workspace shell in the next feature unit.

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

## In Progress

- None yet.

## Next Up

- Feature spec 08 editor workspace shell.

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
