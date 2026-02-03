import ResetPasswordForm from "./reset-password-form";

type ResetPasswordPageProps = {
  searchParams: { token?: string };
};

export const metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = typeof searchParams.token === "string" ? searchParams.token : "";

  if (!token) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="dw-h2">Invalid reset link</h1>
        <p className="text-sm text-muted-foreground">Request a new password reset link.</p>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
