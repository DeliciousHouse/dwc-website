import { SiteImage } from "@/components/site-image";
import { Button } from "@/ui/button";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <h1 className="dw-h1">Contact</h1>
          <p className="dw-lead max-w-xl">
            Questions about an order, the club, or what to pour with dinner tonight? We’re happy to help.
          </p>
          <div className="dw-card p-6">
            <div className="text-sm font-semibold">Email</div>
            <div className="mt-1 text-sm text-muted-foreground">support@deliciouswines.example</div>
            <div className="mt-4 text-sm font-semibold">Hours</div>
            <div className="mt-1 text-sm text-muted-foreground">Mon–Fri, 9am–5pm PT</div>
          </div>
          <Button size="lg">Send a message (coming soon)</Button>
        </div>

        <div className="dw-card overflow-hidden">
          <div className="relative aspect-[4/3]">
            <SiteImage id="contactVineyard" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}

