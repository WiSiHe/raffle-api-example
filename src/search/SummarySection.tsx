import { useState } from 'react';
import type { SummaryResponse } from '../types';
import { errorMessage, formatSummaryText } from './searchUtils';
import { cn } from '../lib/utils';
import { ChevronRight } from 'lucide-react';

export function SummarySection({
  isLoadingSummary,
  isSummaryError,
  summaryError,
  hasSubmittedSearch,
  summary,
}: Readonly<{
  isLoadingSummary: boolean;
  isSummaryError: boolean;
  summaryError: unknown;
  hasSubmittedSearch: boolean;
  summary: SummaryResponse | undefined;
}>) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isSummaryError) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/10 text-destructive text-sm" role="alert">
        <p>{errorMessage(summaryError)}</p>
      </div>
    );
  }

  if (!hasSubmittedSearch) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Run a search to see an AI summary here.
      </p>
    );
  }

  if (isLoadingSummary && !summary?.summary) {
    return (
      <div className="space-y-4 animate-pulse py-2">
        <div className="h-4 bg-nbim-sea/10 rounded w-full" />
        <div className="h-4 bg-nbim-sea/10 rounded w-5/6" />
        <div className="h-4 bg-nbim-sea/10 rounded w-4/6" />
      </div>
    );
  }

  if (summary?.status === 'success' || (isLoadingSummary && summary?.summary)) {
    const isSuccess = summary?.status === 'success';
    
    return (
      <div className="space-y-6">
        <div className="relative">
          <div className={cn(
            "max-w-none transition-all duration-500 overflow-hidden",
            !isExpanded && "max-h-32"
          )}>
            <div
              className="text-lg leading-[1.8] font-serif font-normal text-foreground/90"
              dangerouslySetInnerHTML={formatSummaryText(summary.summary + (!isSuccess ? ' ✦' : ''))}
            />
          </div>
          
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] uppercase tracking-widest font-bold text-nbim-sea hover:text-nbim-midnight transition-colors flex items-center gap-1"
          >
            {isExpanded ? "Show Less" : "Read More"}
            <ChevronRight className={cn("w-3 h-3 transition-transform", isExpanded ? "-rotate-90" : "rotate-90")} />
          </button>
        </div>

        {isSuccess && summary.references && summary.references.length > 0 && (
          <div className="pt-6 border-t border-nbim-border-subdued space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Source Citations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {summary.references.map((ref, index) => (
                <a
                  key={`${ref.url}-${index}`}
                  href={ref.url}
                  className="group flex items-start gap-2.5 text-xs text-muted-foreground hover:text-nbim-sea transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded bg-nbim-sea/5 text-[10px] font-bold text-nbim-sea transition-colors group-hover:bg-nbim-sea group-hover:text-white">
                    {index + 1}
                  </span>
                  <span className="underline-offset-4 group-hover:underline line-clamp-2 leading-tight">
                    {ref.title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (summary?.status === 'no-relevant-results') {
    return (
      <div className="p-4 rounded-lg bg-orange-50 border border-orange-100 text-orange-800 text-sm italic">
        No relevant summary could be generated for this query based on institutional documentation.
      </div>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      No summary available for this query.
    </p>
  );
}
