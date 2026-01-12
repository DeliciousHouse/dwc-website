import Link from "next/link";
import { siteImages } from "@/assets/siteImages";

export const metadata = {
  title: "Photo Credits",
};

export default function PhotoCreditsPage() {
  const images = Object.values(siteImages);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="dw-h2">Photo credits</h1>
        <p className="dw-lead mt-2 max-w-2xl">
          We love great photography. Here are credits for every stock image used on the site.
        </p>
      </div>

      <div className="dw-card overflow-hidden">
        <div className="divide-y divide-border/70">
          {images.map((img) => (
            <div key={img.id} className="grid gap-2 p-5 sm:grid-cols-[220px_1fr] sm:gap-6">
              <div className="text-sm font-medium text-foreground">{img.id}</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="break-all">
                  <span className="font-medium text-foreground">Path:</span> {img.localPath}
                </div>
                <div>
                  <span className="font-medium text-foreground">Credit:</span>{" "}
                  <Link className="underline underline-offset-4 hover:text-foreground" href={img.creditUrl}>
                    {img.creditText}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

