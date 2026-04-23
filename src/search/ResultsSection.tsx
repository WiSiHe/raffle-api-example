import type { SearchResult } from '../types';
import { sendFeedback } from '../api/api';
import { errorMessage, getMetadataValue } from './searchUtils';

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
        {results.map((result, index) => {
          const description = getMetadataValue(result, 'description');
          const image = getMetadataValue(result, 'og:image');

          return (
            <a
              key={`${result.url}-${index}`}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-lg border border-nbim-border-subdued bg-card p-4 text-left shadow-sm transition-all hover:border-nbim-sea/50 hover:bg-nbim-on-light-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nbim-sea sm:p-5"
              onClick={() => {
                void sendFeedback(result.feedback_data);
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {image && (
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded bg-muted sm:h-20 sm:w-28">
                    <img 
                      src={image} 
                      alt="" 
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="block text-base font-semibold text-nbim-sea group-hover:underline">
                    {result.title}
                  </span>
                  <div
                    className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: description || truncateByWords(result.content, 40) }}
                  />
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-nbim-midnight/40 uppercase tracking-wider">
                    <span>NBIM Public</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{new URL(result.url).hostname}</span>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      No search results for this query.
    </p>
  );
}
