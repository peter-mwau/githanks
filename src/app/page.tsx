"use client";

import { useState } from "react";
import Link from "next/link";
import { EnhancedContributor, GitHubRepository } from "@/lib/types";
import { parseGitHubUrl } from "@/lib/config";

export default function Home() {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [repository, setRepository] =
    useState<Partial<GitHubRepository> | null>(null);
  const [contributors, setContributors] = useState<EnhancedContributor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repositoryUrl.trim()) return;

    setLoading(true);
    setError("");
    setRepository(null);
    setContributors([]);

    try {
      // Parse repository URL using improved parser
      const parsed = parseGitHubUrl(repositoryUrl);
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

      // Fetch contributors
      const contributorsResponse = await fetch(
        `/api/github/contributors?owner=${encodeURIComponent(
          owner
        )}&repo=${encodeURIComponent(repo)}&per_page=20`
      );
      const contributorsData = await contributorsResponse.json();

      if (!contributorsData.success) {
        throw new Error(
          contributorsData.error || "Failed to fetch contributors"
        );
      }

      setContributors(contributorsData.data);
    } catch (err) {
      console.error("Error fetching repository data:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🙏 GitThanks
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Appreciation for Open-Source Contributors
          </p>
        </div>

        {/* Repository Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="repository-url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                GitHub Repository URL
              </label>
              <input
                type="text"
                id="repository-url"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <div className="mt-2 text-sm text-gray-500">
                <p>Examples:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>https://github.com/facebook/react</li>
                  <li>https://github.com/microsoft/vscode.git</li>
                  <li>facebook/react</li>
                </ul>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Loading..." : "Fetch Contributors"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
              <div className="mt-2 text-sm text-red-600">
                <p>Make sure you:</p>
                <ul className="list-disc list-inside ml-4">
                  <li>Enter a valid GitHub repository URL</li>
                  <li>Check that the repository exists and is public</li>
                  <li>
                    Verify your GitHub token is set in environment variables
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Repository Information */}
        {repository && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Repository Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Name</h3>
                <p className="text-gray-600">{repository.full_name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Stars</h3>
                <p className="text-gray-600">
                  {repository.stargazers_count?.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Forks</h3>
                <p className="text-gray-600">
                  {repository.forks_count?.toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Language</h3>
                <p className="text-gray-600">{repository.language || "N/A"}</p>
              </div>
            </div>
            {repository.description && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700">Description</h3>
                <p className="text-gray-600">{repository.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Contributors List */}
        {contributors.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Contributors
              </h2>
              <Link
                href="/analytics"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                📊 View Analytics
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contributors.map((contributor) => (
                <div
                  key={contributor.login}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {contributor.user_details?.name || contributor.login}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{contributor.login}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Contributions:</span>
                      <span className="font-medium text-gray-500">
                        {contributor.contributions}
                      </span>
                    </div>
                    {contributor.lines_added !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Lines Added:</span>
                        <span className="font-medium text-green-600">
                          +{contributor.lines_added.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {contributor.user_details?.location && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-400">
                          {contributor.user_details.location}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => generateMessage(contributor)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
                  >
                    Generate Thank You
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built with ❤️ for the open-source community</p>
        </div>
      </div>
    </div>
  );
}
