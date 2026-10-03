/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation resets the native disclosure without client state. */
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
        <a className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/story">Story</a>
        <a className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/shop">Selections</a>
        <a className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/wine-club">Club</a>
        <a className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/tastings">Tastings</a>
        <a className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/contact">Contact</a>
        <a className="rounded-md px-4 py-3 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" href="/account">Account</a>
      </nav>
    </details>
  );
}
