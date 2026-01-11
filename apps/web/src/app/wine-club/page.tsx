import Link from "next/link";

export const metadata = {
  title: "Wine Club",
  description: "A curated drop every quarter—join for the surprise, stay for the bottles.",
};

export default function WineClubPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">The Wine Club</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-300">
          A curated drop every quarter—join for the surprise, stay for the bottles.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-black">
          <div className="text-lg font-semibold">6-bottle quarterly</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Perfect for weeknights and hosting. A balanced mix of reds/whites with tasting notes.
          </div>
          <div className="mt-5">
            <Link className="text-sm underline underline-offset-4" href="/signup">
              Join (coming soon)
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-black">
          <div className="text-lg font-semibold">12-bottle quarterly</div>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            For collectors, dinner parties, and “let’s open something great” moments.
          </div>
          <div className="mt-5">
            <Link className="text-sm underline underline-offset-4" href="/signup">
              Join (coming soon)
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-700 dark:border-white/10 dark:bg-black dark:text-zinc-300">
        <div className="font-medium text-zinc-950 dark:text-white">What you’ll get</div>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Curated, seasonal bottles (no filler)</li>
          <li>Tasting notes + pairing ideas</li>
          <li>Compliance-first delivery (adult signature where required)</li>
          <li>Easy member management (skip/cancel anytime)</li>
        </ul>
      </div>
    </div>
  );
}

