export type Question = {
  question: string;
};

export type TopQuestionsResponse = {
  questions: Array<Question>;
};

export type Suggestion = {
  suggestion: string;
};

export type SuggestionsResponse = {
  suggestions: Array<Suggestion>;
};

export type Reference = {
  index: number;
  title: string;
  url: string;
  content: string;
};

export type SummaryResponse = {
  status: "success" | "no-relevant-results";
  summary: string;
  references: Array<Reference>;
};

export type SearchResult = {
  type: "paragraph";
  title: string;
  content: string;
  url: string;
  preview_url: string;
  feedback_data: string;
  metadata: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
  configuration: Record<string, unknown> | null;
};

export type SearchResultsResponse = {
  results: Array<SearchResult>;
};
