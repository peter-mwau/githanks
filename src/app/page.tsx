"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EnhancedContributor } from "@/lib/types";
import { useRepository } from "@/contexts/RepositoryContext";
import RepositorySearchForm from "@/components/RepositorySearchForm";

export default function Home() {
  const {
    repositoryUrl,
    setRepositoryUrl,
    repository,
    contributors,
    loading,
    error,
    enhanced,
    setEnhanced,
    fetchRepositoryData,
    clearError,
  } = useRepository();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const contributorsPerPage = 12;
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = async () => {
    setCurrentPage(1); // Reset to first page on new search
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

  // Pagination logic
  const totalPages = Math.ceil(contributors.length / contributorsPerPage);
  const startIndex = (currentPage - 1) * contributorsPerPage;
  const endIndex = startIndex + contributorsPerPage;
  const currentContributors = contributors.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    document.getElementById("contributors-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
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

        {/* Repository Search Form Component */}
        <RepositorySearchForm
          repositoryUrl={repositoryUrl}
          setRepositoryUrl={setRepositoryUrl}
          loading={loading}
          error={error}
          enhanced={enhanced}
          setEnhanced={setEnhanced}
          onSubmit={handleSubmit}
          clearError={clearError}
        />

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
              <div>
                <h3 className="font-semibold text-gray-700">Watchers</h3>
                <p className="text-gray-600">
                  {repository.watchers_count || "N/A"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Open Issues</h3>
                <p className="text-gray-600">
                  {repository.open_issues_count || "N/A"}
                </p>
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
          <div
            id="contributors-section"
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Contributors
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, contributors.length)} of{" "}
                  {contributors.length.toLocaleString()} contributors
                </p>
              </div>
              <Link
                href="/analytics"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                📊 View Analytics
              </Link>
            </div>

            {/* Contributors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentContributors.map((contributor, index) => {
                return (
                  <div
                    key={`${contributor.login}-${contributor.id}-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Image
                        src={contributor.avatar_url || "/window.svg"}
                        alt={contributor.login}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/window.svg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {contributor.user_details?.name || contributor.login}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          @{contributor.login}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Contributions:</span>
                        <span className="font-medium text-gray-900">
                          {contributor.contributions.toLocaleString()}
                        </span>
                      </div>
                      {contributor.lines_added !== undefined &&
                        contributor.lines_added > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Lines Added:</span>
                            <span className="font-medium text-green-600">
                              +{contributor.lines_added.toLocaleString()}
                            </span>
                          </div>
                        )}
                      {contributor.lines_deleted !== undefined &&
                        contributor.lines_deleted > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              Lines Deleted:
                            </span>
                            <span className="font-medium text-red-600">
                              -{contributor.lines_deleted.toLocaleString()}
                            </span>
                          </div>
                        )}
                      {contributor.user_details?.location && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium text-gray-600 truncate">
                            {contributor.user_details.location}
                          </span>
                        </div>
                      )}
                      {contributor.type === "Bot" && (
                        <div className="flex justify-center">
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            🤖 Bot
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Personal Info Toggle Button */}
                    {contributor.user_details && (
                      <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full mb-3 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>
                          {showDetails ? "Hide" : "Show"} Personal Info
                        </span>
                        <svg
                          className={`w-4 h-4 transform transition-transform ${
                            showDetails ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Collapsible Personal Info Section */}
                    {showDetails && contributor.user_details && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border space-y-2 text-sm">
                        {contributor.user_details.email && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">📧</span>
                            <a
                              href={`mailto:${contributor.user_details.email}`}
                              className="text-blue-600 hover:text-blue-800 truncate"
                            >
                              {contributor.user_details.email}
                            </a>
                          </div>
                        )}

                        {contributor.user_details.twitter_username && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">🐦</span>
                            <a
                              href={`https://twitter.com/${contributor.user_details.twitter_username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 truncate"
                            >
                              @{contributor.user_details.twitter_username}
                            </a>
                          </div>
                        )}

                        {contributor.user_details.blog && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">🌐</span>
                            <a
                              href={contributor.user_details.blog}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 truncate"
                            >
                              {contributor.user_details.blog}
                            </a>
                          </div>
                        )}

                        {contributor.user_details.company && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">🏢</span>
                            <span className="text-gray-700 truncate">
                              {contributor.user_details.company}
                            </span>
                          </div>
                        )}

                        {contributor.user_details.bio && (
                          <div className="flex items-start space-x-2">
                            <span className="text-gray-500 mt-0.5">📝</span>
                            <p className="text-gray-700 text-xs leading-relaxed">
                              {contributor.user_details.bio}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <span>
                              👥 {contributor.user_details.followers} followers
                            </span>
                            <span>
                              📚 {contributor.user_details.public_repos} repos
                            </span>
                          </div>
                        </div>

                        {contributor.last_contribution && (
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>🕒</span>
                            <span>
                              Last active:{" "}
                              {new Date(
                                contributor.last_contribution
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => generateMessage(contributor)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
                    >
                      Generate Thank You
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className="px-2 py-2 text-sm text-gray-500">
                            ...
                          </span>
                        )}
                      </>
                    )}

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      if (pageNumber < 1 || pageNumber > totalPages)
                        return null;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNumber
                              ? "bg-indigo-600 text-white"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 py-2 text-sm text-gray-500">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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