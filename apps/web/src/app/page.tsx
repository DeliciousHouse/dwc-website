import Link from "next/link";
import { SiteImage } from "@/components/site-image";
import { Button } from "@/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Delicious Wines</p>
          <h1 className="dw-h1">Wine belongs in culture, not inventory.</h1>
          <p className="dw-lead max-w-xl">
            We publish a concise selection with context you can trust. The list is short. The standards are strict.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/story">Read the story</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Adult signature required where applicable. Must be 21+ to purchase.
          </p>
        </div>
        <div className="relative aspect-[4/5] w-full">
          <SiteImage
            id="heroVineyard"
            fill
            priority
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Editorial statement */}
      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="space-y-4">
          <h2 className="dw-h2">The list is quiet by design.</h2>
          <p className="dw-lead">
            Each release centers on people, place, and the table it is made for. We share only what fits that frame.
          </p>
          <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/shop">
            View current selections
          </Link>
        </div>
        <div className="relative aspect-[3/4] w-full">
          <SiteImage id="storyBarrel" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>
    </div>
  );
}
