import Link from "next/link";

const posts = [
  {
    slug: "welcome-to-delicious-wines",
    title: "Welcome to Delicious Wines",
    excerpt:
      "What we’re building, how we pick bottles, and how to get the most out of your next pour.",
    date: "2026-01-11",
  },
  {
    slug: "pairing-cheat-sheet",
    title: "A no-stress pairing cheat sheet",
    excerpt:
      "A few simple rules (and a couple fun exceptions) that make food + wine instantly easier.",
    date: "2026-01-11",
  },
  {
    slug: "how-the-club-works",
    title: "How the Wine Club works",
    excerpt:
      "Quarterly shipments, flexible membership, and what to expect in each curated drop.",
    date: "2026-01-11",
  },
];

export const metadata = {
  title: "Blog",
  description: "Notes, pairings, producers, and what we’re loving right now.",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">The Blog</h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-300">
          Notes, pairings, producers, and what we’re loving right now.
        </p>
      </div>

      <div className="grid gap-4">
        {posts.map((p) => (
          <div
            key={p.slug}
            className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-black"
          >
            <div className="text-xs text-zinc-500 dark:text-zinc-400">{p.date}</div>
            <div className="mt-1 text-lg font-semibold">{p.title}</div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{p.excerpt}</div>
            <div className="mt-4">
              <Link className="text-sm underline underline-offset-4" href="#">
                Read more (coming soon)
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

