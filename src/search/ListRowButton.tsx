import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

export function ListRowButton({
  children,
  onPick,
}: Readonly<{ children: ReactNode; onPick: () => void }>) {
  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-md px-2 py-2 text-left text-sm transition-colors',
        'hover:bg-nbim-on-light-hover hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nbim-sea'
      )}
      onClick={onPick}
    >
      {children}
    </button>
  );
}
