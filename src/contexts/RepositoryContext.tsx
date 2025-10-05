"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { EnhancedContributor, GitHubRepository } from "@/lib/types";
import { parseGitHubUrl } from "@/lib/config";

interface RepositoryContextType {
  repositoryUrl: string;
  repository: Partial<GitHubRepository> | null;
  contributors: EnhancedContributor[];
  allContributors: EnhancedContributor[];
  loading: boolean;
  error: string;
  enhanced: boolean;
  setRepositoryUrl: (url: string) => void;
  setRepository: (repo: Partial<GitHubRepository> | null) => void;
  setContributors: (contributors: EnhancedContributor[]) => void;
  setAllContributors: (contributors: EnhancedContributor[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setEnhanced: (enhanced: boolean) => void;
  realtimeIndex: boolean;
  setRealtimeIndex: (value: boolean) => void;
  fetchRepositoryData: (url?: string) => Promise<void>;
  fetchAllContributors: () => Promise<void>;
  clearError: () => void;
  // Elasticsearch functions
  indexContributorsInElasticsearch: (
    contributors: EnhancedContributor[]
  ) => Promise<boolean>;
  searchContributorsInElasticsearch: (
    query: string
  ) => Promise<EnhancedContributor[]>;
  // Search state
  searchResults: EnhancedContributor[] | null;
  setSearchResults: (results: EnhancedContributor[] | null) => void;
  searchMode: "local" | "elastic";
  setSearchMode: (mode: "local" | "elastic") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(
  undefined
);

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error("useRepository must be used within a RepositoryProvider");
  }
  return context;
}

interface RepositoryProviderProps {
  children: ReactNode;
}

export function RepositoryProvider({ children }: RepositoryProviderProps) {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [repository, setRepository] =
    useState<Partial<GitHubRepository> | null>(null);
  const [contributors, setContributors] = useState<EnhancedContributor[]>([]);
  const [allContributors, setAllContributors] = useState<EnhancedContributor[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enhanced, setEnhanced] = useState(true);
  const [realtimeIndex, setRealtimeIndex] = useState(false);

  // Search state
  const [searchResults, setSearchResults] = useState<
    EnhancedContributor[] | null
  >(null);
  const [searchMode, setSearchMode] = useState<"local" | "elastic">("local");
  const [searchQuery, setSearchQuery] = useState("");

  const clearError = () => setError("");

  const indexContributorsInElasticsearch = async (
    contributors: EnhancedContributor[]
  ) => {
    try {
      console.log(
        `📤 Indexing ${contributors.length} contributors in Elasticsearch...`
      );

      const response = await fetch("/api/elastic/index", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contributors),
      });

      const result = await response.json();
      if (result.success) {
        console.log(
          `✅ Successfully indexed ${result.indexedCount} contributors in Elasticsearch`
        );
        return true;
      } else {
        console.error("❌ Indexing failed:", result.message);
        if (result.errors) {
          console.error("Indexing errors:", result.errors);
        }
        return false;
      }
    } catch (error) {
      console.error("❌ Indexing error:", error);
      return false;
    }
  };

  const searchContributorsInElasticsearch = async (
    query: string
  ): Promise<EnhancedContributor[]> => {
    if (!query.trim()) {
      return [];
    }

    try {
      console.log(`🔍 Searching Elasticsearch for: "${query}"`);

      const response = await fetch(
        `/api/elastic/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.results) {
        console.log(`✅ Found ${data.results.length} results in Elasticsearch`);
        return data.results;
      }
      return [];
    } catch (error) {
      console.error("❌ Elasticsearch search error:", error);
      return [];
    }
  };

  // Initialize Elasticsearch index
  const initializeElasticsearchIndex = async () => {
    try {
      const response = await fetch("/api/elastic/init", {
        method: "POST",
      });
      const result = await response.json();
      if (result.success) {
        console.log("✅ Elasticsearch index initialized");
      } else {
        console.warn(
          "⚠️ Elasticsearch initialization warning:",
          result.message
        );
      }
    } catch (error) {
      console.error("❌ Elasticsearch initialization error:", error);
    }
  };

  const fetchRepositoryData = async (url?: string) => {
    const urlToUse = url || repositoryUrl;
    if (!urlToUse.trim()) return;

    setLoading(true);
    setError("");
    setRepository(null);
    setContributors([]);
    setSearchResults(null); // Clear previous search results
    setSearchQuery(""); // Clear search query

    try {
      // Parse repository URL using improved parser
      const parsed = parseGitHubUrl(urlToUse);
      if (!parsed) {
        throw new Error(
          "Invalid GitHub repository URL. Please enter a valid GitHub repository URL like: https://github.com/owner/repository"
        );
      }

      const { owner, repo } = parsed;

      console.log(`📡 Fetching data for: ${owner}/${repo}`);

      // Initialize Elasticsearch if realtime indexing is enabled
      if (realtimeIndex) {
        await initializeElasticsearchIndex();
      }

      // Fetch repository data
      const repoResponse = await fetch(
        `/api/github/repository?owner=${encodeURIComponent(
          owner
        )}&repo=${encodeURIComponent(repo)}`
      );
      const repoData = await repoResponse.json();

      if (!repoData.success) {
        throw new Error(repoData.error || "Failed to fetch repository");
      }

      setRepository(repoData.data);

      // Fetch contributors for home page
      console.log("🚀 Fetching contributors for home page...");
      console.log(
        "📡 API URL:",
        `/api/github/contributors?owner=${encodeURIComponent(
          owner
        )}&repo=${encodeURIComponent(
          repo
        )}&fetch_all=true&enhanced=${enhanced}&realtime_index=${realtimeIndex}&max_pages=0&force_complete=false`
      );

      const contributorsResponse = await fetch(
        `/api/github/contributors?owner=${encodeURIComponent(
          owner
        )}&repo=${encodeURIComponent(
          repo
        )}&fetch_all=true&enhanced=${enhanced}&realtime_index=${realtimeIndex}&max_pages=0&force_complete=false`
      );
      const contributorsData = await contributorsResponse.json();

      if (!contributorsData.success) {
        throw new Error(
          contributorsData.error || "Failed to fetch contributors"
        );
      }

      console.log(
        `✅ Fetched ${contributorsData.data.length.toLocaleString()} contributors (${
          enhanced ? "Enhanced" : "Basic"
        } mode)`
      );

      // Enhanced debugging info
      console.log("📊 API Response Meta:", contributorsData.meta);
      console.log(
        "📄 Pages fetched:",
        contributorsData.meta?.pages_fetched || "unknown"
      );
      console.log(
        "🚫 Rate limit hit:",
        contributorsData.meta?.rate_limit_hit || false
      );
      console.log(
        "📈 Total fetched from API:",
        contributorsData.meta?.total_fetched || "unknown"
      );

      // Show warnings if any
      if (contributorsData.meta?.warning) {
        console.warn(`⚠️ ${contributorsData.meta.warning}`);
      }

      // Debug the first few and last few contributors
      console.log(
        "🥇 First 3 contributors:",
        contributorsData.data.slice(0, 3)
      );
      console.log("🥉 Last 3 contributors:", contributorsData.data.slice(-3));

      setContributors(contributorsData.data);

      // Index contributors in Elasticsearch if realtime indexing is enabled
      if (realtimeIndex && contributorsData.data.length > 0) {
        console.log("🔄 Indexing contributors in Elasticsearch...");
        // Don't await this - let it happen in the background
        indexContributorsInElasticsearch(contributorsData.data).then(
          (success) => {
            if (success) {
              console.log("🎉 Contributors indexed successfully!");
            } else {
              console.warn("⚠️ Contributor indexing completed with errors");
            }
          }
        );
      }

      // Update URL state if different URL was used
      if (url && url !== repositoryUrl) {
        setRepositoryUrl(url);
      }
    } catch (err) {
      console.error("❌ Error fetching repository data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllContributors = async () => {
    if (!repositoryUrl.trim()) return;

    // Don't fetch if we already have contributors
    if (allContributors.length > 0) {
      console.log("Already have all contributors, skipping fetch");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const parsed = parseGitHubUrl(repositoryUrl);
      if (!parsed) {
        throw new Error("Invalid GitHub repository URL");
      }

      const { owner, repo } = parsed;

      console.log(
        `🚀 Fetching ALL contributors for analytics: ${owner}/${repo}`
      );

      // For analytics, get ALL contributors with unlimited pages and force completion
      const response = await fetch(
        `/api/github/contributors?owner=${encodeURIComponent(
          owner
        )}&repo=${encodeURIComponent(
          repo
        )}&fetch_all=true&enhanced=${enhanced}&max_pages=0&force_complete=true`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch all contributors");
      }

      console.log(
        `✅ Fetched ${data.data.length.toLocaleString()} contributors for analytics`
      );
      console.log(`📊 Pages fetched: ${data.meta?.pages_fetched || "unknown"}`);

      if (data.meta?.warning) {
        console.warn(`⚠️ ${data.meta.warning}`);
      }

      if (data.meta?.rate_limit_hit) {
        console.log("🕒 Rate limit was hit but we got results anyway!");
      }

      setAllContributors(data.data);

      // Index all contributors in Elasticsearch if realtime indexing is enabled
      if (realtimeIndex && data.data.length > 0) {
        console.log(
          "🔄 Indexing all contributors in Elasticsearch for analytics..."
        );
        indexContributorsInElasticsearch(data.data).then((success) => {
          if (success) {
            console.log(
              "🎉 All contributors indexed successfully for analytics!"
            );
          }
        });
      }
    } catch (err) {
      console.error("❌ Error fetching all contributors:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Fallback: If analytics fetch fails, try to use the basic contributors
      if (contributors.length > 0) {
        console.log("📋 Using basic contributors as fallback for analytics");
        setAllContributors(contributors);
      }
    } finally {
      setLoading(false);
    }
  };

  const value: RepositoryContextType = {
    repositoryUrl,
    repository,
    contributors,
    allContributors,
    loading,
    error,
    enhanced,
    setRepositoryUrl,
    setRepository,
    setContributors,
    setAllContributors,
    setLoading,
    setError,
    setEnhanced,
    realtimeIndex,
    setRealtimeIndex,
    fetchRepositoryData,
    fetchAllContributors,
    clearError,
    // Elasticsearch functions
    indexContributorsInElasticsearch,
    searchContributorsInElasticsearch,
    // Search state
    searchResults,
    setSearchResults,
    searchMode,
    setSearchMode,
    searchQuery,
    setSearchQuery,
  };

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
}
