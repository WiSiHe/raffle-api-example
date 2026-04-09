import type { SummaryResponse } from '../types';
import { errorMessage } from './searchUtils';

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
  if (isSummaryError) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {errorMessage(summaryError)}
      </p>
    );
  }
  if (!hasSubmittedSearch) {
    return (
      <p className="text-sm text-muted-foreground">
        Run a search to see an AI summary here.
      </p>
    );
  }
  if (isLoadingSummary) {
    return (
      <p className="text-sm text-muted-foreground">Generating summary…</p>
    );
  }
  if (summary?.status === 'success') {
    return (
      <>
        <div
          className="text-sm text-foreground [&>ol]:list-decimal [&>ol]:pl-6 [&>ul]:list-disc [&>ul]:pl-6 [&>p>a]:font-semibold [&>p>a]:text-nbim-sea [&>p>a]:underline-offset-4 [&>p>a]:hover:underline"
          dangerouslySetInnerHTML={{ __html: summary.summary }}
        />
        {summary.references.length > 0 ? (
          <>
            <h3 className="mt-4 mb-2 text-sm font-semibold text-foreground">
              References
            </h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {summary.references.map((ref, index) => (
                <li key={`${ref.url}-${index}`}>
                  <a
                    href={ref.url}
                    className="text-nbim-sea underline-offset-4 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ref.title}
                  </a>
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </>
    );
  }
  if (summary?.status === 'no-relevant-results') {
    return (
      <p className="text-sm text-muted-foreground">
        No relevant summary could be generated for this query.
      </p>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      No summary available for this query.
    </p>
  );
}
