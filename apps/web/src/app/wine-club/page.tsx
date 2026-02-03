import Link from "next/link";

export const metadata = {
  title: "Wine Club",
  description: "A quarterly release with clear notes and simple choices.",
};

export default function WineClubPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="dw-h1">The Wine Club</h1>
        <p className="dw-lead mt-2 max-w-2xl">
          A quarterly release with a short list, clear notes, and steady quality.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-3 border-t border-border/70 pt-4">
          <div className="text-lg font-semibold">6-bottle quarterly</div>
          <div className="text-sm text-muted-foreground">
            A balanced mix for regular dinners and small tables. Notes included.
          </div>
          <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/signup">
            Join (coming soon)
          </Link>
        </div>

        <div className="space-y-3 border-t border-border/70 pt-4">
          <div className="text-lg font-semibold">12-bottle quarterly</div>
          <div className="text-sm text-muted-foreground">
            A deeper release for hosting or cellaring. Notes included.
          </div>
          <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/signup">
            Join (coming soon)
          </Link>
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">What you receive</div>
        <ul className="list-disc space-y-1 pl-5">
          <li>Seasonal bottles selected to a strict standard.</li>
          <li>Tasting notes and pairing guidance.</li>
          <li>Compliance-first delivery and adult signature when required.</li>
          <li>Member controls to skip or cancel.</li>
        </ul>
      </div>
    </div>
  );
}

