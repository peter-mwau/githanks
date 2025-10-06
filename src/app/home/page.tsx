"use client";

import { useState } from "react";
import Image from "next/image";
import { EnhancedContributor } from "@/lib/types";
import { useRepository } from "../../contexts/RepositoryContext";
import SearchBar from "../../components/SearchBar";
import ElasticSearchBar from "../../components/ElasticSearchBar";
import BulkMessagingModal from "../../components/BulkMessagingModal";
import type { Dispatch, SetStateAction } from "react";

interface HomePageProps {
  setCurrentPage?: Dispatch<SetStateAction<string>>;
}

export default function Home({ setCurrentPage }: HomePageProps) {
  const {
    repositoryUrl,
    setRepositoryUrl,
    repository,
    contributors,
    loading,
    error,
    enhanced,
    setEnhanced,
    realtimeIndex,
    setRealtimeIndex,
    fetchRepositoryData,
    clearError,
    // New search state from context
    searchResults,
    setSearchResults,
    searchMode,
    setSearchMode,
    searchQuery,
    setSearchQuery,
  } = useRepository();

  // Rename this to avoid conflict with main navigation
  const [currentPageNumber, setCurrentPageNumber] = useState(1); // Changed from currentPage
  const contributorsPerPage = 12;
  const [showDetails, setShowDetails] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const handleSearch = async () => {
    clearError();
    setCurrentPageNumber(1); // Reset pagination to first page
    setSearchResults(null); // Clear previous search results
    setSearchQuery(""); // Clear search query
    setSearchMode("local"); // Reset to local search mode
    await fetchRepositoryData();
  };

  const generateMessage = async (contributor: EnhancedContributor) => {
    try {
      const response = await fetch("/api/ai/generate-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contributor,
          repositoryName: repository?.name || "this project",
          style: "professional",
          includeStats: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.data.message);
      } else {
        alert("Failed to generate message: " + data.error);
      }
    } catch (err) {
      alert(
        "Error generating message: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleGoAnalytics = () => {
    if (setCurrentPage) {
      setCurrentPage("analytics");
    } else {
      // Fallback: use Next.js navigation if setCurrentPage is not available
      window.location.href = "/";
    }
  };

  // Determine which contributors to display
  const displayContributors =
    searchMode === "elastic" && searchResults ? searchResults : contributors;

  // Filter local contributors when in local search mode with query
  const filteredContributors =
    searchQuery && searchMode === "local"
      ? contributors.filter(
          (contributor) =>
            contributor.login
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            contributor.user_details?.name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            contributor.user_details?.bio
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            contributor.user_details?.location
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            contributor.user_details?.company
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        )
      : displayContributors;

  const totalPages = Math.ceil(
    filteredContributors.length / contributorsPerPage
  );
  const startIndex = (currentPageNumber - 1) * contributorsPerPage; // Use currentPageNumber
  const endIndex = startIndex + contributorsPerPage;
  const currentContributors = filteredContributors.slice(startIndex, endIndex);

  const handleElasticSearchResults = (results: EnhancedContributor[]) => {
    setSearchResults(results);
    setSearchMode("elastic");
    setCurrentPageNumber(1); // Reset pagination to first page
  };

  const handleClearSearch = () => {
    setSearchResults(null);
    setSearchMode("local");
    setSearchQuery("");
    setCurrentPageNumber(1); // Reset pagination
  };

  const handleLocalSearch = (query: string) => {
    if (!query.trim()) {
      handleClearSearch();
      return;
    }

    setSearchQuery(query);
    setSearchMode("local");
    setSearchResults(null);
    setCurrentPageNumber(1); // Reset pagination
  };

  const goToPage = (page: number) => {
    setCurrentPageNumber(page); // Use currentPageNumber
    document.getElementById("contributors-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToPrevPage = () => {
    if (currentPageNumber > 1) goToPage(currentPageNumber - 1); // Use currentPageNumber
  };

  const goToNextPage = () => {
    if (currentPageNumber < totalPages) goToPage(currentPageNumber + 1); // Use currentPageNumber
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-500 mb-4">
            🙏 GitThanks
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            AI-Powered Appreciation for Open-Source Contributors
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-white/20 dark:border-gray-700/30">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start justify-between">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600 dark:hover:text-red-300"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Enhanced Mode & Indexing - Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Enhanced Mode Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      enhanced
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-gray-100 dark:bg-gray-700/50"
                    }`}
                  >
                    {enhanced ? (
                      <span className="text-blue-600 dark:text-blue-400 text-lg">
                        🔍
                      </span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400 text-lg">
                        ⚡
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {enhanced ? "Enhanced Mode" : "Basic Mode"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {enhanced
                        ? "Full profiles with detailed info"
                        : "Fast loading, basic info"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEnhanced(!enhanced)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    enhanced ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enhanced ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      enhanced ? "bg-yellow-400" : "bg-green-400"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {enhanced ? "Slower" : "Faster"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      enhanced ? "bg-green-400" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {enhanced ? "Rich data" : "Basic"}
                  </span>
                </div>
              </div>
            </div>

            {/* Realtime Indexing Card */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      realtimeIndex
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-gray-100 dark:bg-gray-700/50"
                    }`}
                  >
                    <span
                      className={`text-lg ${
                        realtimeIndex
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      📊
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Realtime Indexing
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {realtimeIndex
                        ? "Search optimized"
                        : "Enable for fast search"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRealtimeIndex(!realtimeIndex)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    realtimeIndex
                      ? "bg-green-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      realtimeIndex ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      realtimeIndex ? "bg-blue-400" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {realtimeIndex ? "Fast search" : "Standard"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      realtimeIndex ? "bg-purple-400" : "bg-gray-400"
                    }`}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {realtimeIndex ? "Elasticsearch" : "Basic"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Repository Search Bar */}
          <div className="mb-6">
            <SearchBar
              value={repositoryUrl}
              onChange={setRepositoryUrl}
              onSubmit={handleSearch}
              placeholder="Enter GitHub repo (e.g., facebook/react)"
              loading={loading}
            />
          </div>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            💡 Try: facebook/react, microsoft/vscode, or any public GitHub repo
          </p>

          {/* Contributor Search (only show when we have contributors) */}
          {contributors.length > 0 && (
            <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-8 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Search Contributors
                </h3>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm px-3 py-1.5 rounded-full ${
                      realtimeIndex
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    }`}
                  >
                    {realtimeIndex ? "🔍 Elasticsearch" : "⚡ Local Search"}
                  </span>
                  {searchMode === "elastic" && searchResults && (
                    <button
                      onClick={handleClearSearch}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Show All Contributors
                    </button>
                  )}
                </div>
              </div>

              {realtimeIndex ? (
                <ElasticSearchBar
                  onSearchResults={handleElasticSearchResults}
                  onSearchStart={() => setSearchResults(null)}
                  onClearSearch={handleClearSearch}
                  placeholder="Search indexed contributors by name, username, bio, location..."
                  loading={loading}
                  disabled={loading}
                />
              ) : (
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleLocalSearch(searchQuery);
                        }
                      }}
                      placeholder="Search contributors by name, username, bio, location..."
                      className="w-full px-4 py-3 pl-12 pr-12 text-gray-900 dark:text-white bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400 dark:text-gray-500"
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
                    </div>
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                      >
                        <svg
                          className="h-5 w-5"
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
                  <button
                    onClick={() => handleLocalSearch(searchQuery)}
                    disabled={!searchQuery.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium whitespace-nowrap shadow-lg hover:shadow-xl"
                  >
                    Search
                  </button>
                </div>
              )}

              {/* Search Stats */}
              {(searchQuery || searchResults) && (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {searchMode === "elastic" ? (
                    <>
                      Found {searchResults?.length || 0} results in
                      Elasticsearch
                      {searchQuery && ` for "${searchQuery}"`}
                    </>
                  ) : (
                    <>
                      Found {filteredContributors.length} results locally
                      {searchQuery && ` for "${searchQuery}"`}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Repository Information */}
        {repository && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-white/20 dark:border-gray-700/30">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Repository Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </h3>
                <p className="text-gray-900 dark:text-white text-lg">
                  {repository.full_name}
                </p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Stars
                </h3>
                <p className="text-gray-900 dark:text-white text-lg">
                  {repository.stargazers_count?.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Forks
                </h3>
                <p className="text-gray-900 dark:text-white text-lg">
                  {repository.forks_count?.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </h3>
                <p className="text-gray-900 dark:text-white text-lg">
                  {repository.language || "N/A"}
                </p>
              </div>
            </div>
            {repository.description && (
              <div className="mt-6 bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {repository.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Contributors List */}
        {filteredContributors.length > 0 && (
          <div
            id="contributors-section"
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {searchMode === "elastic" && searchResults
                    ? "Search Results"
                    : "Contributors"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, filteredContributors.length)} of{" "}
                  {filteredContributors.length.toLocaleString()} contributors
                  {searchMode === "elastic" &&
                    searchResults &&
                    " (from search)"}
                  {searchMode === "local" &&
                    searchQuery &&
                    " (from local search)"}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGoAnalytics}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  📊 View Analytics
                </button>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  📨 Bulk Messages
                </button>
              </div>
            </div>

            {/* Contributors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentContributors.map((contributor, index) => (
                <div
                  key={`${contributor.login}-${contributor.id}-${index}`}
                  className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <Image
                      src={contributor.avatar_url || "/window.svg"}
                      alt={contributor.login}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white/50 dark:border-gray-600/50"
                      onError={(e) => {
                        e.currentTarget.src = "/window.svg";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                        {contributor.user_details?.name || contributor.login}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        @{contributor.login}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Contributions:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {contributor.contributions.toLocaleString()}
                      </span>
                    </div>
                    {contributor.lines_added !== undefined &&
                      contributor.lines_added > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Lines Added:
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            +{contributor.lines_added.toLocaleString()}
                          </span>
                        </div>
                      )}
                    {contributor.user_details?.location && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Location:
                        </span>
                        <span className="font-medium text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
                          {contributor.user_details.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {contributor.user_details && (
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full mb-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      {showDetails ? "Hide" : "Show"} Details
                    </button>
                  )}

                  {showDetails && contributor.user_details && (
                    <div className="mb-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 space-y-3 text-sm max-h-40 overflow-y-auto">
                      {/* ... existing details code (updated with dark mode) ... */}
                      {contributor.user_details.email && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400">
                            📧
                          </span>
                          <a
                            href={`mailto:${contributor.user_details.email}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                          >
                            {contributor.user_details.email}
                          </a>
                        </div>
                      )}
                      {contributor.user_details.bio && (
                        <p className="text-gray-700 dark:text-gray-300 text-xs">
                          {contributor.user_details.bio}
                        </p>
                      )}
                      {contributor.user_details.blog && (
                        <div className="flex items-center gap-2">
                          <span>🔗</span>
                          <a
                            href={
                              contributor.user_details.blog.startsWith("http")
                                ? contributor.user_details.blog
                                : `https://${contributor.user_details.blog}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            {contributor.user_details.blog}
                          </a>
                        </div>
                      )}
                      {contributor.user_details.twitter_username && (
                        <div className="flex items-center gap-2">
                          <span>🐦</span>
                          <a
                            href={`https://twitter.com/${contributor.user_details.twitter_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            @{contributor.user_details.twitter_username}
                          </a>
                        </div>
                      )}
                      {contributor.user_details.company && (
                        <div className="flex items-center gap-2">
                          <span>🏢</span>
                          <span className="text-gray-700 dark:text-gray-300 text-xs truncate">
                            {contributor.user_details.company}
                          </span>
                        </div>
                      )}
                      {contributor.user_details.location && (
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="text-gray-700 dark:text-gray-300 text-xs truncate">
                            {contributor.user_details.location}
                          </span>
                        </div>
                      )}
                      {contributor.user_details.html_url && (
                        <div className="flex items-center gap-2">
                          <span>👤</span>
                          <a
                            href={contributor.user_details.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            View GitHub Profile
                          </a>
                        </div>
                      )}
                      {contributor.user_details.public_repos && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Public Repositories:
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">
                            {contributor.user_details.public_repos.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {contributor.user_details.followers !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Followers:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">
                            {contributor.user_details.followers.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {contributor.user_details.following !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Following:</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300 text-xs">
                            {contributor.user_details.following.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {contributor.user_details.created_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date Joined:</span>
                          <span className="font-medium text-purple-500">
                            {new Date(
                              contributor.user_details.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => generateMessage(contributor)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                  >
                    Generate Thank You
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPageNumber} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPageNumber === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 disabled:opacity-50 transition-all duration-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPageNumber === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-600/50 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-700/50 disabled:opacity-50 transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show message when no contributors found after search */}
        {contributors.length > 0 && filteredContributors.length === 0 && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-12 text-center border border-white/20 dark:border-gray-700/30">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-6">
              🔍
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              No contributors found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              {searchMode === "elastic"
                ? "No contributors match your search in Elasticsearch."
                : "No contributors match your local search."}
            </p>
            <button
              onClick={handleClearSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all duration-200 text-base font-medium shadow-lg hover:shadow-xl"
            >
              Show All Contributors
            </button>
          </div>
        )}

        {contributors.length > 0 && (
          <BulkMessagingModal
            contributors={contributors}
            repositoryName={repository?.name || ""}
            isOpen={showBulkModal}
            onClose={() => setShowBulkModal(false)}
          />
        )}

        {/* Footer */}
        <div className="text-center mt-16 mb-8 text-gray-500 dark:text-gray-400">
          <p className="text-lg">Built with ❤️ for the open-source community</p>
        </div>
      </div>
    </div>
  );
}
