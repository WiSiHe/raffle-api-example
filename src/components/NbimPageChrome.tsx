import type { ReactNode } from 'react';

export function NbimPageChrome({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex flex-col min-h-screen font-sans antialiased bg-nbim-page text-foreground">
      <header className="text-white border-b border-nbim-border-subdued bg-nbim-midnight">
        <div className="flex gap-3 items-center px-4 py-3 sm:px-6 lg:px-8">
          <div
            className="flex justify-center items-center w-9 h-9 text-xs font-bold tracking-tighter rounded-sm shrink-0 bg-white/10"
            aria-hidden
          >
            NB
          </div>
          <div className="min-w-0">
            <p className="">Raffle Search API</p>
          </div>
        </div>
      </header>
      <main className="flex flex-col flex-1">{children}</main>
      <footer className="border-t border-nbim-border-subdued bg-card/80">
        <div className="px-4 py-4 mx-auto max-w-6xl text-xs text-center text-muted-foreground sm:px-6 lg:px-8">
          Standalone demo — styling references nbim.no; not the live fund
          website.
        </div>
      </footer>
    </div>
  );
}
