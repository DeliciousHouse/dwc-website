import { SiteImage } from "@/components/site-image";
import { Button } from "@/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Our Story",
};

export default function StoryPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <h1 className="dw-h1">A small club with a big taste for great bottles.</h1>
          <p className="dw-lead max-w-xl">
            Delicious Wines is built around one idea: make discovering wine feel effortless—without sacrificing quality.
            We curate what we genuinely love, then ship it with the details you need to enjoy it.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/shop">Shop wines</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/wine-club">Join the club</Link>
            </Button>
          </div>
        </div>

        <div className="dw-card group overflow-hidden">
          <div className="relative aspect-[3/4]">
            <SiteImage
              id="storyBarrel"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition duration-700 group-hover:scale-105"
              priority
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="dw-card p-6">
          <div className="text-sm font-semibold">Curate</div>
          <p className="mt-2 text-sm text-muted-foreground">
            We choose bottles with real character—balanced, expressive, and made by people we’d love to meet.
          </p>
        </div>
        <div className="dw-card p-6">
          <div className="text-sm font-semibold">Explain</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Tasting notes and pairing ideas that don’t feel like homework—just enough to make the next pour better.
          </p>
        </div>
        <div className="dw-card p-6">
          <div className="text-sm font-semibold">Deliver</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Compliance-first checkout and adult signature delivery where required—because trust matters.
          </p>
        </div>
      </div>
    </div>
  );
}

