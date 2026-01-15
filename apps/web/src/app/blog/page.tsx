import Link from "next/link";

import { posts } from "./posts";

export const metadata = {
  title: "Blog",
  description: "Notes, pairings, producers, and what we’re loving right now.",
};

export default function BlogPage() {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
  const adSlots = [
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP,
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE,
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM,
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="dw-h1">The Blog</h1>
        <p className="dw-lead mt-2 max-w-2xl">
          Notes, pairings, producers, and what we’re loving right now.
        </p>
      </div>

      <div className="grid gap-6">
        {posts.map((p, index) => (
          <div key={p.slug} className="dw-card p-5">
            <div className="text-xs text-muted-foreground">{p.date}</div>
            <div className="mt-1 text-lg font-semibold">{p.title}</div>
            <div className="mt-2 text-sm text-muted-foreground">{p.excerpt}</div>
            <div className="mt-4">
              <Link
                className="text-sm underline underline-offset-4 hover:text-foreground"
                href={`/blog/${p.slug}`}
              >
                Read more (coming soon)
              </Link>
            </div>

            {index % 3 === 1 && (
              <div className="mt-6 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-sm text-muted-foreground">
                {adClient && adSlots[Math.floor(index / 3)] ? (
                  <ins
                    className="adsbygoogle block min-h-[120px]"
                    data-ad-client={adClient}
                    data-ad-slot={adSlots[Math.floor(index / 3)]}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                    aria-label="Advertisement"
                  />
                ) : (
                  <div>
                    Advertisement slot (set `NEXT_PUBLIC_ADSENSE_CLIENT` and slot envs)
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

