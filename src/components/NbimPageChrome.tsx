import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

export function NbimPageChrome({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex flex-col min-h-screen font-sans antialiased bg-nbim-page text-foreground">
      <header className="text-white border-b border-nbim-border-subdued bg-nbim-midnight">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="flex justify-center items-center w-9 h-9 text-xs font-bold tracking-tighter rounded-sm shrink-0 bg-white/10"
              aria-hidden
            >
              NB
            </div>
            <div className="min-w-0">
              <p className="font-semibold">Raffle Search API</p>
            </div>
          </div>
          
          <nav className="flex gap-4 mt-1 sm:mt-0 sm:ml-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors hover:text-nbim-sea",
                  isActive ? "text-nbim-sea" : "text-white/70"
                )
              }
            >
              Standard
            </NavLink>
            <NavLink
              to="/orchestrated"
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors hover:text-nbim-sea",
                  isActive ? "text-nbim-sea" : "text-white/70"
                )
              }
            >
              Orchestrated
            </NavLink>
          </nav>
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

