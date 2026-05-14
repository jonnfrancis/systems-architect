import { SignIn } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { afterSignInPath, signInPath, signUpPath } from "@/lib/auth-routes";

export default function SignInPage() {
  return (
    <AuthPageShell>
      <SignIn
        path={signInPath}
        routing="path"
        signUpUrl={signUpPath}
        fallbackRedirectUrl={afterSignInPath}
      />
    </AuthPageShell>
  );
}
