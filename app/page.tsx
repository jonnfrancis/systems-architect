import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { afterSignInPath, signInPath } from "@/lib/auth-routes";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect(afterSignInPath);
  }

  redirect(signInPath);
}
