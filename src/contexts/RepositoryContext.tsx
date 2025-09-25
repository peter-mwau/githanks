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
  setRepositoryUrl: (url: string) => void;
  setRepository: (repo: Partial<GitHubRepository> | null) => void;
  setContributors: (contributors: EnhancedContributor[]) => void;
  setAllContributors: (contributors: EnhancedContributor[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  fetchRepositoryData: (url?: string) => Promise<void>;
  fetchAllContributors: () => Promise<void>;
  clearError: () => void;
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

  const clearError = () => setError("");

  const fetchRepositoryData = async (url?: string) => {
    const urlToUse = url || repositoryUrl;
    if (!urlToUse.trim()) return;

    setLoading(true);
    setError("");
    setRepository(null);
    setContributors([]);

    try {
      // Parse repository URL using improved parser
      const parsed = parseGitHubUrl(urlToUse);
      if (!parsed) {
        throw new Error(
          "Invalid GitHub repository URL. Please enter a valid GitHub repository URL like: https://github.com/owner/repository"
        );
      }

      const { owner, repo } = parsed;

      console.log(`Fetching data for: ${owner}/${repo}`);

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

      // Fetch contributors for home page (unlimited but fast basic mode)
      console.log("🚀 Fetching contributors for home page...");
      console.log(
        "📡 API URL:",
        `/api/github/contributors?owner=${encodeURIComponent(
          owner
        )}&repo=${encodeURIComponent(
          repo
        )}&fetch_all=true&enhanced=false&max_pages=0&force_complete=false`
      );

      const contributorsResponse = await fetch(
        `/api/github/contributors?owner=${encodeURIComponent(
          owner
        )}&repo=${encodeURIComponent(
          repo
        )}&fetch_all=true&enhanced=true&max_pages=0&force_complete=false`
      );
      const contributorsData = await contributorsResponse.json();

      if (!contributorsData.success) {
        throw new Error(
          contributorsData.error || "Failed to fetch contributors"
        );
      }

      console.log(
        `✅ Fetched ${contributorsData.data.length.toLocaleString()} contributors for home page`
      );

      // 🔍 Enhanced debugging info
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

      // 🔍 Debug the first few and last few contributors
      console.log(
        "🥇 First 3 contributors:",
        contributorsData.data.slice(0, 3)
      );
      console.log("🥉 Last 3 contributors:", contributorsData.data.slice(-3));

      setContributors(contributorsData.data);

      // Update URL state if different URL was used
      if (url && url !== repositoryUrl) {
        setRepositoryUrl(url);
      }
    } catch (err) {
      console.error("Error fetching repository data:", err);
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
        )}&fetch_all=true&enhanced=false&max_pages=0&force_complete=true`
        // ⬆️ CHANGED: max_pages=0 (unlimited), force_complete=true (wait through rate limits)
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
    } catch (err) {
      console.error("Error fetching all contributors:", err);
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
    setRepositoryUrl,
    setRepository,
    setContributors,
    setAllContributors,
    setLoading,
    setError,
    fetchRepositoryData,
    fetchAllContributors,
    clearError,
  };

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
}
