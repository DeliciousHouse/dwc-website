import { Suspense } from "react";
import SignInClient from "./signin-client";

export default function SignInPage() {
  // Wrap useSearchParams() in suspense to satisfy Next.js prerender rules.
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-6 py-12 text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <SignInClient />
    </Suspense>
  );
}

