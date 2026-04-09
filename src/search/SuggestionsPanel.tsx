import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import type { Question, Suggestion } from '../types';
import { ListRowButton } from './ListRowButton';
import { errorMessage } from './searchUtils';

export function SuggestionsPanel({
  showSuggestionsPanel,
  debouncedTrimmed,
  listTitle,
  listLoading,
  listError,
  listErrorDetail,
  suggestions,
  topQuestions,
  onPick,
}: Readonly<{
  showSuggestionsPanel: boolean;
  debouncedTrimmed: string;
  listTitle: string;
  listLoading: boolean;
  listError: boolean;
  listErrorDetail: unknown;
  suggestions: Suggestion[];
  topQuestions: Question[];
  onPick: (text: string) => void;
}>) {
  let body: ReactNode;
  if (listError) {
    body = (
      <p className="text-sm text-destructive" role="alert">
        {errorMessage(listErrorDetail)}
      </p>
    );
  } else if (listLoading) {
    body = <p className="text-sm text-muted-foreground">Loading…</p>;
  } else if (showSuggestionsPanel) {
    body =
      suggestions.length > 0 ? (
        <ul className="space-y-1">
          {suggestions.map(({ suggestion }, index) => (
            <li key={`${suggestion}-${index}`}>
              <ListRowButton onPick={() => onPick(suggestion)}>
                {suggestion}
              </ListRowButton>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No matching suggestions. Try another phrase or run a full search.
        </p>
      );
  } else if (topQuestions.length > 0) {
    body = (
      <ul className="space-y-1">
        {topQuestions.map((question, index) => (
          <li key={`${question.question}-${index}`}>
            <ListRowButton onPick={() => onPick(question.question)}>
              {question.question}
            </ListRowButton>
          </li>
        ))}
      </ul>
    );
  } else {
    body = (
      <p className="text-sm text-muted-foreground">
        No top questions available.
      </p>
    );
  }

  return (
    <section
      aria-busy={listLoading}
      className="rounded-lg border border-nbim-border-subdued bg-card text-card-foreground shadow-sm"
    >
      <div className="space-y-1 border-b border-nbim-border-subdued px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-nbim-midnight">
            {listTitle}
          </h2>
          {listLoading ? (
            <Loader2
              className="h-5 w-5 shrink-0 animate-spin text-nbim-sea"
              aria-hidden
            />
          ) : null}
        </div>
        {showSuggestionsPanel ? (
          <p className="text-sm text-muted-foreground">
            Autocomplete for &ldquo;{debouncedTrimmed}&rdquo;
          </p>
        ) : null}
      </div>
      <div className="px-5 py-5 sm:px-6">{body}</div>
    </section>
  );
}
