import { SiteImage } from "@/components/site-image";
import Link from "next/link";

export const metadata = {
  title: "Our Story",
};

export default function StoryPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <h1 className="dw-h1">We keep the list small and the context clear.</h1>
          <p className="dw-lead max-w-xl">
            Delicious Wines is a short editorial selection. We publish only what meets the standard and explain why it
            belongs on the table.
          </p>
          <Link className="text-sm underline underline-offset-4 hover:text-foreground" href="/shop">
            View current selections
          </Link>
        </div>

        <div className="relative aspect-[3/4]">
          <SiteImage
            id="storyBarrel"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="max-w-3xl space-y-4">
        <h2 className="dw-h2">How we work</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Curate.</span> We choose bottles with balance, restraint, and a
            clear point of view.
          </li>
          <li>
            <span className="font-medium text-foreground">Explain.</span> Notes are short, specific, and meant to be used.
          </li>
          <li>
            <span className="font-medium text-foreground">Deliver.</span> Compliance first, adult signature where required.
          </li>
        </ul>
      </div>
    </div>
  );
}

