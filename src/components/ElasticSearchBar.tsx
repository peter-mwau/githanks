"use client";

import { useState, useEffect, useRef } from "react";
import { EnhancedContributor } from "@/lib/types";

interface ElasticSearchBarProps {
  onSearchResults: (results: EnhancedContributor[]) => void;
  onSearchStart?: () => void;
  onClearSearch?: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

export default function ElasticSearchBar({
  onSearchResults,
  onSearchStart,
  onClearSearch,
  placeholder = "Search contributors by name, username, bio...",
  loading = false,
  disabled = false,
}: ElasticSearchBarProps) {
  const [query, setQuery] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      onSearchResults([]);
      if (onClearSearch) {
        onClearSearch();
      }
      setLastSearchedQuery("");
      return;
    }

    // Don't search if it's the same query
    if (query === lastSearchedQuery) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLocalLoading(true);
      onSearchStart?.();
      setLastSearchedQuery(query);

      try {
        const response = await fetch(
          `/api/elastic/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        if (data.results) {
          onSearchResults(data.results);
        } else {
          onSearchResults([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
        onSearchResults([]);
      } finally {
        setLocalLoading(false);
      }
    }, 500); // Increased debounce time to 500ms

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, lastSearchedQuery, onSearchResults, onSearchStart, onClearSearch]);

  const handleClear = () => {
    setQuery("");
    setLastSearchedQuery("");
    if (onClearSearch) {
      onClearSearch();
    }
  };

  const isLoading = loading || localLoading;

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="w-full px-4 py-3 pl-10 pr-10 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>

        {/* Clear Button */}
        {query && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search status */}
      {lastSearchedQuery && (
        <div className="mt-2 text-sm text-gray-500">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              Searching for `{lastSearchedQuery}``...
            </span>
          ) : (
            `Showing results for "${lastSearchedQuery}"`
          )}
        </div>
      )}
    </div>
  );
}
