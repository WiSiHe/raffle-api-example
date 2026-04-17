import { useState, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import {
  fetchSearchResults,
  fetchSuggestions,
  fetchTopQuestions,
} from '../api/api';
import { streamOpenAICompletion } from '../api/openai';
import { SummaryResponse } from '../types';

export function useSearchPage() {
  const [query, setQuery] = useState('');
  const [userInput, setUserInput] = useState(false);
  const [hasSubmittedSearch, setHasSubmittedSearch] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isSummaryError, setIsSummaryError] = useState(false);
  const [summaryError, setSummaryError] = useState<Error | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
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
    mutateAsync: handleFetchResults,
  } = useMutation({
    mutationKey: ['search'],
    mutationFn: fetchSearchResults,
  });



  const handleSearch = async (searchQuery: string = query) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;
    
    startTimeRef.current = performance.now();
    setDuration(null);
    setSummary(null);
    setIsLoadingSummary(true);
    setIsSummaryError(false);
    setHasSubmittedSearch(true);
    
    try {
      // 1. Fetch search results first (Required for synthesis)
      const searchResults = await handleFetchResults(trimmedQuery);
      
      // 2. Prepare context for OpenAI
      const context = searchResults.map((r, i) => `[${i+1}] ${r.title}: ${r.content}`).join('\n\n');
      
      const messages = [
        { 
          role: "system", 
          content: "You are an institutional investment analyst at NBIM. Synthesize a concise, objective summary based ONLY on the provided documentation snippets. Use [n] for citations where n is the result index. Focus on fund policies, holdings, and management mandates. If the information is not in the snippets, say you don't have enough documentation on that topic."
        },
        { 
          role: "user", 
          content: `Question: ${trimmedQuery}\n\nDocumentation:\n${context}`
        }
      ];

      // 3. Stream OpenAI completion
      await streamOpenAICompletion(messages, (chunk) => {
        setSummary((prev) => {
          if (!prev) {
            return {
              status: "success",
              summary: chunk,
              references: searchResults.slice(0, 3).map((r, i) => ({ 
                index: i + 1, 
                title: r.title, 
                url: r.url, 
                content: r.content 
              })),
            };
          }
          return {
            ...prev,
            summary: prev.summary + chunk,
          };
        });
      });
      
      setIsLoadingSummary(false);
      
      const endTime = performance.now();
      setDuration(Math.round((endTime - startTimeRef.current) / 100) / 10);
    } catch (e) {
      console.error('Search failed:', e);
      setIsSummaryError(true);
      setSummaryError(e instanceof Error ? e : new Error('Search failed'));
      setIsLoadingSummary(false);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setUserInput(false);
    setHasSubmittedSearch(false);
    setDuration(null);
    setSummary(null);
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
  };
}
