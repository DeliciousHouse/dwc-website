import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/invert_DW_logo.png"
            alt="Delicious Wines"
            width={64}
            height={64}
            className="rounded-lg bg-black p-2"
            priority
          />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Delicious Wines</h1>
            <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-300">
              Great bottles, zero guesswork. Shop favorites or join the club for a curated drop every quarter.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          href="/shop"
        >
          Shop bottles
        </Link>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-black dark:text-white dark:hover:bg-white/5"
          href="/wine-club"
        >
          Explore the Wine Club
        </Link>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-black dark:text-white dark:hover:bg-white/5"
          href="/blog"
        >
          Read the blog
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 dark:border-white/10 dark:bg-black dark:text-zinc-300">
          <div className="font-medium text-zinc-950 dark:text-white">Curated picks</div>
          <div className="mt-1">Seasonal bottles chosen for you—approachable, exciting, and always delicious.</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 dark:border-white/10 dark:bg-black dark:text-zinc-300">
          <div className="font-medium text-zinc-950 dark:text-white">Ship with confidence</div>
          <div className="mt-1">Compliance-first checkout and adult signature delivery where required.</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 dark:border-white/10 dark:bg-black dark:text-zinc-300">
          <div className="font-medium text-zinc-950 dark:text-white">Drink better</div>
          <div className="mt-1">Tasting notes, pairing ideas, and stories behind the producers on the blog.</div>
        </div>
      </div>
    </div>
  );
}
