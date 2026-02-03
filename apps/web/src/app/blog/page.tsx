import Link from "next/link";

import { AdSlot } from "@/components/ad-slot";

import { posts } from "./posts";

export const metadata = {
  title: "Journal",
  description: "Notes on producers, tables, and the people behind them.",
};

export default function BlogPage() {
  const adSlots = [
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP,
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_MIDDLE,
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM,
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="dw-h1">Journal</h1>
        <p className="dw-lead mt-2 max-w-2xl">
          Notes on producers, tables, and the people behind them.
        </p>
      </div>

      <div className="grid gap-6">
        {posts.map((p, index) => (
          <div key={p.slug} className="border-t border-border/70 pt-5">
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

