import Link from "next/link";
import { SiteImage } from "@/components/site-image";
import { Button } from "@/ui/button";

export const metadata = {
  title: "Tastings",
};

export default function TastingsPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <h1 className="dw-h1">Tastings & events</h1>
          <p className="dw-lead max-w-xl">
            Pop-ups, bottle shares, and guided tastings. A casual way to discover new favorites—without the pressure.
          </p>
          <Button asChild size="lg">
            <Link href="/contact">Get notified</Link>
          </Button>
        </div>
        <div className="dw-card group overflow-hidden">
          <div className="relative aspect-[4/5]">
            <SiteImage
              id="tastingGlasses"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </div>

      <div className="dw-card p-6">
        <div className="text-sm font-semibold">Upcoming</div>
        <p className="mt-2 text-sm text-muted-foreground">
          No events posted yet. We’ll add the first tasting soon—join the list and you’ll be first to know.
        </p>
      </div>
    </div>
  );
}

