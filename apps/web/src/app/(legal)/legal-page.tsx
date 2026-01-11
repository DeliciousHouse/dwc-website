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
    <div className="prose prose-zinc max-w-none dark:prose-invert">
      <div className="not-prose mb-6">
        <Link
          href="/"
          className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-300"
        >
          ← Back home
        </Link>
      </div>
      <h1>{title}</h1>
      {updated ? (
        <p className="text-sm text-zinc-500">Last updated: {updated}</p>
      ) : null}
      {children}
    </div>
  );
}

