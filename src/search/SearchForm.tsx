import { X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

type SearchFormProps = Readonly<{
  query: string;
  onQueryChange: (value: string) => void;
  onSubmitSearch: () => void;
  onClear: () => void;
  mode?: string;
  onModeChange?: (mode: string) => void;
  showModeSwitcher?: boolean;
}>;

export function SearchForm({
  query,
  onQueryChange,
  onSubmitSearch,
  onClear,
  mode,
  onModeChange,
  showModeSwitcher = true,
}: SearchFormProps) {
  return (
    <div className="rounded-xl border border-nbim-border-subdued bg-card p-4 shadow-sm sm:p-5 space-y-4">
      {showModeSwitcher && (
        <div className="flex flex-wrap gap-2 mb-2">
          {[
            { id: 'SMART_ROUTING', label: 'Smart routing', icon: '🧠' },
            { id: 'HYBRID_OPTIMIZER', label: 'Hybrid search', icon: '💎' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange?.(m.id)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                mode === m.id
                  ? 'bg-nbim-midnight text-white border-nbim-midnight shadow-md'
                  : 'bg-white text-nbim-midnight border-nbim-border-default hover:border-nbim-sea'
              }`}
            >
              <span className="mr-1.5">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitSearch();
        }}
        role="search"
        aria-label="Search the knowledge base"
      >
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="relative">
            <Input
              id="search-query"
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              className="h-12 border-nbim-border-default bg-background pr-10 shadow-sm focus-visible:ring-nbim-sea text-base"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="What would you like to know about NBIM?"
              aria-describedby="search-hint"
            />
            {query.length > 0 ? (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-nbim-on-light-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nbim-sea"
                aria-label="Clear search field"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
        <Button
          type="submit"
          disabled={query.trim().length === 0}
          className="h-12 px-8 bg-nbim-midnight text-white hover:bg-nbim-midnight/90 sm:w-auto"
        >
          Execute
        </Button>
      </form>
      {mode && (
        <p id="search-hint" className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-nbim-sea" />
          {mode === 'SMART_ROUTING' && 'AI will decide the best engine for your request'}
          {mode === 'HYBRID_OPTIMIZER' && 'Exhaustive parallel search across all engines with analytical synthesis'}
        </p>
      )}
    </div>
  );
}
