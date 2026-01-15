import Link from "next/link";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          ← Back home
        </Link>
      </div>
      <h1 className="dw-h1">{title}</h1>
      {updated ? (
        <p className="text-xs text-muted-foreground">Last updated: {updated}</p>
      ) : null}
      <div className="space-y-4 text-sm text-muted-foreground [&_h2]:dw-h2 [&_h2]:mt-6 [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}

