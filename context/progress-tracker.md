# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Prisma data layer complete

## Current Goal

- Ready to select the next implementation feature unit.

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

## In Progress

- None yet.

## Next Up

- Choose and implement the next feature unit from the project specs.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

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
