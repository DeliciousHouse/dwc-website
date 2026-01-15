import Link from "next/link";

export const metadata = {
  title: "Wine Club",
  description: "A curated drop every quarter—join for the surprise, stay for the bottles.",
};

export default function WineClubPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="dw-h1">The Wine Club</h1>
        <p className="dw-lead mt-2 max-w-2xl">
          A curated drop every quarter—join for the surprise, stay for the bottles.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="dw-card p-6">
          <div className="text-lg font-semibold">6-bottle quarterly</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Perfect for weeknights and hosting. A balanced mix of reds/whites with tasting notes.
          </div>
          <div className="mt-5">
            <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/signup">
              Join (coming soon)
            </Link>
          </div>
        </div>

        <div className="dw-card p-6">
          <div className="text-lg font-semibold">12-bottle quarterly</div>
          <div className="mt-2 text-sm text-muted-foreground">
            For collectors, dinner parties, and “let’s open something great” moments.
          </div>
          <div className="mt-5">
            <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/signup">
              Join (coming soon)
            </Link>
          </div>
        </div>
      </div>

      <div className="dw-card p-6 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">What you’ll get</div>
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

