import Link from "next/link";

import { AdSlot } from "@/components/ad-slot";

import { posts } from "./posts";

export const metadata = {
  title: "Blog",
  description: "Notes, pairings, producers, and what we’re loving right now.",
};

export default function BlogPage() {
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
                Read more
              </Link>
            </div>

            {index % 3 === 1 && (
              <AdSlot
                className="mt-6"
                slot={adSlots[Math.floor(index / 3)]}
                label="Blog list advertisement"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

