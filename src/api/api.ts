import {
  SearchResultsResponse,
  SuggestionsResponse,
  SummaryResponse,
  TopQuestionsResponse,
} from "../types";
import { routes } from "./routes";
import { getOrCreateSessionId } from "./sessionId";
import { urlBuilder } from "./utils";

const uid = import.meta.env.VITE_RAFFLE_UI_UID;

// Ensure the environment variable is set
if (!uid) {
  throw new Error(
    "Environment variable VITE_RAFFLE_UI_UID is not set. Please set it in your .env file to use the Raffle API."
  );
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text.trim() ||
        `Request failed (${response.status} ${response.statusText})`
    );
  }
  return response.json() as Promise<T>;
}

export const fetchTopQuestions = async () => {
  const url = urlBuilder(routes.topQuestionsURL, { uid });
  const response = await fetch(url);
  const data = await parseJson<TopQuestionsResponse>(response);
  return data.questions;
};

export const fetchSuggestions = async (query: string) => {
  const url = urlBuilder(routes.suggestionsURL, {
    uid,
    query,
    limit: "5",
  });
  const response = await fetch(url);
  const data = await parseJson<SuggestionsResponse>(response);
  return data.suggestions;
};

export const fetchSearchResults = async (query: string) => {
  const url = urlBuilder(routes.searchURL, {
    uid,
    query,
    preview: "true",
    device: "desktop",
    "session-id": getOrCreateSessionId(),
  });
  const response = await fetch(url);
  const data = await parseJson<SearchResultsResponse>(response);
  return data.results;
};

export const fetchSummary = async (query: string) => {
  const url = urlBuilder(routes.summaryURL, { uid, query });
  const response = await fetch(url);
  return parseJson<SummaryResponse>(response);
};

/**
 * Notify Raffle when a user opens a search result (click-through / relevance).
 * @see https://docs.raffle.ai/api/guides/react/search-results/
 */
export async function sendFeedback(feedbackData: string): Promise<void> {
  if (!feedbackData.trim()) return;

  try {
    const response = await fetch(routes.feedbackURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "click",
        feedback_data: feedbackData,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        text.trim() ||
          `Feedback failed (${response.status} ${response.statusText})`
      );
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[Raffle] sendFeedback:", e);
    }
  }
}
