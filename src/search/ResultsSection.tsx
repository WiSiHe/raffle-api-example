import type { SearchResult } from '../types';
import { sendFeedback } from '../api/api';
import { errorMessage } from './searchUtils';

function truncateByWords(html: string, maxWords: number) {
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.innerText || div.textContent || '';
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return html;
  return words.slice(0, maxWords).join(' ') + '...';
}

export function ResultsSection({
  isSearchError,
  searchError,
  hasSubmittedSearch,
  isLoadingResults,
  results,
}: Readonly<{
  isSearchError: boolean;
  searchError: unknown;
  hasSubmittedSearch: boolean;
  isLoadingResults: boolean;
  results: SearchResult[];
}>) {
  if (isSearchError) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {errorMessage(searchError)}
      </p>
    );
  }
  if (!hasSubmittedSearch) {
    return null;
  }
  if (isLoadingResults) {
    return (
      <p className="text-sm text-muted-foreground">Loading results…</p>
    );
  }
  if (results.length > 0) {
    return (
      <div className="flex flex-col gap-3">
        {results.map((result, index) => (
          <a
            key={`${result.url}-${index}`}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg border border-nbim-border-subdued bg-card p-4 text-left shadow-sm transition-colors hover:border-nbim-sea/50 hover:bg-nbim-on-light-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nbim-sea focus-visible:ring-offset-2 sm:p-5"
            onClick={() => {
              void sendFeedback(result.feedback_data);
            }}
          >
            <span className="block text-base font-semibold text-nbim-sea group-hover:underline">
              {result.title}
            </span>
            <div
              className="mt-2 text-sm leading-relaxed text-muted-foreground [&>a]:pointer-events-none [&>a]:text-nbim-sea"
              dangerouslySetInnerHTML={{ __html: truncateByWords(result.content, 60) }}
            />
          </a>
        ))}
      </div>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      No search results for this query.
    </p>
  );
}
