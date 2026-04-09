import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import {
  fetchSearchResults,
  fetchSuggestions,
  fetchSummary,
  fetchTopQuestions,
} from '../api/api';

export function useSearchPage() {
  const [query, setQuery] = useState('');
  const [userInput, setUserInput] = useState(false);
  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const debouncedTrimmed = debouncedQuery.trim();
  const suggestionsEnabled = userInput && debouncedTrimmed.length >= 3;

  const {
    data: topQuestions = [],
    isPending: isLoadingTopQuestions,
    isError: isTopQuestionsError,
    error: topQuestionsError,
  } = useQuery({
    queryKey: ['topQuestions'],
    queryFn: fetchTopQuestions,
  });

  const {
    data: suggestions = [],
    isPending: isLoadingSuggestions,
    isError: isSuggestionsError,
    error: suggestionsError,
  } = useQuery({
    queryKey: ['suggestions', debouncedTrimmed],
    queryFn: () => fetchSuggestions(debouncedTrimmed),
    enabled: suggestionsEnabled,
  });

  const {
    data: results = [],
    isPending: isLoadingResults,
    isError: isSearchError,
    error: searchError,
    mutate: handleFetchResults,
  } = useMutation({
    mutationKey: ['search'],
    mutationFn: fetchSearchResults,
  });

  const {
    data: summary,
    isPending: isLoadingSummary,
    isError: isSummaryError,
    error: summaryError,
    mutate: handleFetchSummary,
  } = useMutation({
    mutationKey: ['summary'],
    mutationFn: fetchSummary,
  });

  const handleSearch = (searchQuery: string = query) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    setHasSubmittedSearch(true);
    handleFetchSummary(trimmedQuery);
    handleFetchResults(trimmedQuery);
  };

  const clearQuery = () => {
    setQuery('');
    setUserInput(false);
  };

  const runSuggestionSearch = (text: string) => {
    setUserInput(false);
    setQuery(text);
    handleSearch(text);
  };

  const onQueryChange = (value: string) => {
    setQuery(value);
    setUserInput(true);
  };

  const showSuggestionsPanel = suggestionsEnabled;
  const listTitle = showSuggestionsPanel ? 'Suggestions' : 'Top questions';
  const listLoading = showSuggestionsPanel
    ? isLoadingSuggestions
    : isLoadingTopQuestions;
  const listError = showSuggestionsPanel
    ? isSuggestionsError
    : isTopQuestionsError;
  const listErrorDetail = showSuggestionsPanel
    ? suggestionsError
    : topQuestionsError;

  return {
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
  };
}
