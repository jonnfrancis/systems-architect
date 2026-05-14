import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { signInPath, signUpPath } from "@/lib/auth-routes";

const selfAuthenticatedApiRoutes = ["/api/projects(.*)"];
const publicRoutes = [
  `${signInPath}(.*)`,
  `${signUpPath}(.*)`,
  ...selfAuthenticatedApiRoutes,
];

const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
    "/(api|trpc)(.*)",
  ],
};
