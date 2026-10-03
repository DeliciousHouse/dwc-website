import Link from "next/link";

export function MobileNavigation() {
  return (
    <details className="sm:hidden">
      <summary className="cursor-pointer rounded-md px-2 py-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        Menu
      </summary>
      <nav
        aria-label="Mobile navigation"
        className="absolute inset-x-0 top-full grid border-b border-border/70 bg-background p-4 shadow-lg"
      >
        <Link className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/story">Story</Link>
        <Link className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/shop">Selections</Link>
        <Link className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/wine-club">Club</Link>
        <Link className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/tastings">Tastings</Link>
        <Link className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/contact">Contact</Link>
        <Link className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/account">Account</Link>
      </nav>
    </details>
  );
}
