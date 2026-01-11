import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Delicious Wines</h1>
      <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
        Browse the shop, add bottles to your cart, and check out with required compliance acknowledgments.
      </p>
      <div className="flex gap-3">
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          href="/shop"
        >
          Shop
        </Link>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-black dark:text-white dark:hover:bg-white/5"
          href="/admin/products"
        >
          Admin (MVP)
        </Link>
      </div>
    </div>
  );
}
