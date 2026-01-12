import Link from "next/link";
import { Button } from "@/ui/button";

export const metadata = {
  title: "Account",
};

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="dw-h2">Account</h1>
        <p className="dw-lead mt-2 max-w-2xl">
          Sign in to view your orders, manage your club subscription, and save addresses for faster checkout.
        </p>
      </div>

      <div className="dw-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Not signed in</div>
            <div className="text-sm text-muted-foreground">Log in or create an account to continue.</div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/signin">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

