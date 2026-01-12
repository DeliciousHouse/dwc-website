import Link from "next/link";
import { SiteImage } from "@/components/site-image";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";

const ENABLE_TESTIMONIALS = process.env.NEXT_PUBLIC_ENABLE_TESTIMONIALS === "1";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="dw-card relative overflow-hidden">
        <div className="relative h-[520px]">
          <SiteImage
            id="heroVineyard"
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-background/10" />
          <div className="absolute inset-0">
            <div className="dw-container flex h-full items-end pb-10">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                  Curated bottles • Quarterly club • Fast checkout
                </div>
                <h1 className="dw-h1">Great wine, picked for you.</h1>
                <p className="dw-lead">
                  Discover bottles you’ll actually want to open. Shop favorites or join the club for a seasonal drop every
                  quarter.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/shop">Shop wines</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/wine-club">Join the club</Link>
                  </Button>
                </div>
                <div className="pt-2 text-xs text-muted-foreground">
                  Adult signature required where applicable. Must be 21+ to purchase.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured collections */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Reds worth repeating", body: "Food-friendly, balanced, and crowd-pleasing.", href: "/shop" },
          { title: "Whites with energy", body: "Bright, crisp, and perfect for weeknights.", href: "/shop" },
          { title: "Cellar picks", body: "The bottles we’d save for the right moment.", href: "/shop" },
        ].map((c) => (
          <div key={c.title} className="dw-card p-6">
            <div className="text-sm font-semibold">{c.title}</div>
            <div className="mt-2 text-sm text-muted-foreground">{c.body}</div>
            <div className="mt-4">
              <Link className="text-sm underline underline-offset-4 hover:text-foreground" href={c.href}>
                Shop this collection
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* Story strip */}
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-3">
          <h2 className="dw-h2">Why Delicious Wines</h2>
          <p className="dw-lead">
            We curate bottles with real personality and give you just enough context to enjoy them—no intimidation, no
            filler.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="dw-card p-5">
              <div className="text-sm font-semibold">Chosen with intent</div>
              <div className="mt-1 text-sm text-muted-foreground">Seasonal picks you can trust.</div>
            </div>
            <div className="dw-card p-5">
              <div className="text-sm font-semibold">Fast checkout</div>
              <div className="mt-1 text-sm text-muted-foreground">Apple Pay / Google Pay when available.</div>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/story">Read our story</Link>
          </Button>
        </div>
        <div className="dw-card overflow-hidden">
          <div className="relative aspect-[4/3]">
            <SiteImage id="storyBarrel" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Club teaser */}
      <section className="dw-card overflow-hidden">
        <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-3">
            <h2 className="dw-h2">The Wine Club</h2>
            <p className="dw-lead">Two simple tiers. One great shipment every quarter.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/60 p-5">
                <div className="text-sm font-semibold">6-bottle quarterly</div>
                <div className="mt-1 text-sm text-muted-foreground">Balanced mix + tasting notes.</div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-5">
                <div className="text-sm font-semibold">12-bottle quarterly</div>
                <div className="mt-1 text-sm text-muted-foreground">For hosting and collecting.</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/wine-club">Explore tiers</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          </div>
          <div className="dw-card overflow-hidden">
            <div className="relative aspect-[4/3]">
              <SiteImage id="clubGrapes" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (feature-flagged) */}
      {ENABLE_TESTIMONIALS ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <h2 className="dw-h2">People are opening better bottles</h2>
            <div className="text-xs text-muted-foreground">Enable via NEXT_PUBLIC_ENABLE_TESTIMONIALS=1</div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { quote: "Every shipment feels like a win. Zero duds.", name: "Club member" },
              { quote: "Checkout was instant with Apple Pay. Love it.", name: "Customer" },
              { quote: "The notes are actually helpful—and short.", name: "Customer" },
            ].map((t) => (
              <div key={t.quote} className="dw-card p-6">
                <div className="text-sm text-foreground">“{t.quote}”</div>
                <div className="mt-3 text-xs text-muted-foreground">{t.name}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Email capture */}
      <section className="dw-card p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="space-y-2">
            <h2 className="dw-h2">Get taste notes + early releases</h2>
            <p className="dw-lead">Monthly emails. No spam. Just the good stuff.</p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              className="h-11"
            />
            <Button type="button" className="h-11">
              Join
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
