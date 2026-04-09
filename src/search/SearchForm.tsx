import { X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

type SearchFormProps = Readonly<{
  query: string;
  onQueryChange: (value: string) => void;
  onSubmitSearch: () => void;
  onClear: () => void;
}>;

export function SearchForm({
  query,
  onQueryChange,
  onSubmitSearch,
  onClear,
}: SearchFormProps) {
  return (
    <div className="rounded-xl border border-nbim-border-subdued bg-card p-4 shadow-sm sm:p-5">
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
          <label
            htmlFor="search-query"
            className="text-sm font-medium text-nbim-midnight"
          >
            Search
          </label>
          <div className="relative">
            {/* type="text" avoids duplicate clear controls from native search UI */}
            <Input
              id="search-query"
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              className="border-nbim-border-default bg-background pr-10 shadow-sm focus-visible:ring-nbim-sea"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Type your question…"
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
          className="w-full shrink-0 bg-nbim-midnight text-white hover:bg-nbim-midnight/90 sm:w-auto sm:min-w-[7rem]"
        >
          Search
        </Button>
      </form>
      <p id="search-hint" className="mt-3 text-xs text-muted-foreground">
        Press Enter or Search to load a summary and matching pages.
      </p>
    </div>
  );
}
