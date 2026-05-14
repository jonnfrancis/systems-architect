import { SignUp } from "@clerk/nextjs";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { afterSignUpPath, signInPath, signUpPath } from "@/lib/auth-routes";

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <SignUp
        path={signUpPath}
        routing="path"
        signInUrl={signInPath}
        fallbackRedirectUrl={afterSignUpPath}
      />
    </AuthPageShell>
  );
}
