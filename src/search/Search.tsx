import { Loader2 } from 'lucide-react';
import { SearchForm } from './SearchForm';
import { SuggestionsPanel } from './SuggestionsPanel';
import { SummarySection } from './SummarySection';
import { ResultsSection } from './ResultsSection';
import { useSearchPage } from './useSearchPage';

export function Search() {
  const {
    query,
    hasSubmittedSearch,
    debouncedTrimmed,
    showSuggestionsPanel,
    listTitle,
    listLoading,
    listError,
    listErrorDetail,
    suggestions,
    topQuestions,
    results,
      summary,
    duration,
    isLoadingResults,
    isSearchError,
    searchError,
    isLoadingSummary,
    isSummaryError,
    summaryError,
    handleSearch,
    clearQuery,
    runSuggestionSearch,
    onQueryChange,
  } = useSearchPage();

  return (
    <div className="px-4 py-6 mx-auto w-full max-w-5xl sm:px-6 lg:px-8">
      <header className="mb-6 text-center sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-nbim-sea">
          Example integration
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-nbim-midnight sm:text-4xl">
          Raffle search
        </h1>
      </header>

      <SearchForm
        query={query}
        onQueryChange={onQueryChange}
        onSubmitSearch={() => handleSearch()}
        onClear={clearQuery}
      />

      {/* Summary (main) + suggestions (sidebar on large screens) */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-start xl:gap-10">
        <div className="space-y-0 min-w-0">
          {hasSubmittedSearch ? (
            <section
              aria-busy={isLoadingSummary}
              className="rounded-lg border shadow-sm border-nbim-border-subdued bg-card text-card-foreground overflow-hidden"
            >
              <div className="flex gap-3 justify-between items-center px-5 py-4 border-b border-nbim-border-subdued bg-white sm:px-6">
                <h2 className="text-lg font-semibold text-nbim-midnight">
                  Summary
                </h2>
                <div className="flex items-center gap-4">
                  {duration !== null && (
                    <div className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                      Latency: {duration}s
                    </div>
                  )}
                  {isLoadingSummary ? (
                    <Loader2
                      className="w-5 h-5 animate-spin shrink-0 text-nbim-sea"
                      aria-hidden
                    />
                  ) : null}
                </div>
              </div>
              <div className="px-5 py-5 sm:px-6">
                <SummarySection
                  isLoadingSummary={isLoadingSummary}
                  isSummaryError={isSummaryError}
                  summaryError={summaryError}
                  hasSubmittedSearch={hasSubmittedSearch}
                  summary={summary}
                />
              </div>
            </section>
          ) : (
            <div className="px-4 py-8 text-sm leading-relaxed text-center rounded-lg border border-dashed border-nbim-border-default bg-card/50 text-muted-foreground sm:px-6">
              Run a search to see an AI-generated summary of what we publish on
              this topic.
            </div>
          )}
        </div>

        <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <SuggestionsPanel
            showSuggestionsPanel={showSuggestionsPanel}
            debouncedTrimmed={debouncedTrimmed}
            listTitle={listTitle}
            listLoading={listLoading}
            listError={listError}
            listErrorDetail={listErrorDetail}
            suggestions={suggestions}
            topQuestions={topQuestions}
            onPick={runSuggestionSearch}
          />
        </aside>
      </div>

      <section
        className="pt-10 mt-10 space-y-4 border-t border-nbim-border-subdued"
        aria-busy={hasSubmittedSearch ? isLoadingResults : false}
      >
        <div className="flex gap-3 justify-between items-center">
          <h2 className="text-lg font-semibold text-nbim-midnight">
            Search results
          </h2>
          {hasSubmittedSearch && isLoadingResults ? (
            <Loader2
              className="w-6 h-6 animate-spin shrink-0 text-nbim-sea"
              aria-hidden
            />
          ) : null}
        </div>

        {hasSubmittedSearch ? (
          <ResultsSection
            isSearchError={isSearchError}
            searchError={searchError}
            hasSubmittedSearch={hasSubmittedSearch}
            isLoadingResults={isLoadingResults}
            results={results}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Matching pages from the index will be listed here after you search.
          </p>
        )}
      </section>
    </div>
  );
}
