import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Compliance acknowledged</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Thanks — your compliance acknowledgments were recorded and your cart has been cleared.
      </p>
      <div className="flex gap-3">
        <Link
          className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          href="/shop"
        >
          Back to shop
        </Link>
        <Link
          className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-black dark:text-white dark:hover:bg-white/5"
          href="/"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

