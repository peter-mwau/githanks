"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EnhancedContributor } from "@/lib/types";
import { useRepository } from "@/contexts/RepositoryContext";
import SearchBar from "@/components/SearchBar";
import BulkMessagingModal from "../components/BulkMessagingModal";

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

  const [currentPage, setCurrentPage] = useState(1);
  const contributorsPerPage = 12;
  const [showDetails, setShowDetails] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const handleSearch = async () => {
    clearError();
    setCurrentPage(1);
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
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
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

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start justify-between">
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
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
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

          {/* Enhanced Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {enhanced ? "🔍 Enhanced Mode" : "⚡ Basic Mode"}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    enhanced
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {enhanced ? "Detailed" : "Fast"}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {enhanced
                  ? "Get full profiles (email, social, bio) - slower but comprehensive"
                  : "Get basic info only - faster loading, limited details"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnhanced(!enhanced)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                enhanced ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enhanced ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Search Bar */}
          <SearchBar
            value={repositoryUrl}
            onChange={setRepositoryUrl}
            onSubmit={handleSearch}
            placeholder="Enter GitHub repo (e.g., facebook/react)"
            loading={loading}
          />

          <p className="mt-3 text-xs text-gray-500">
            💡 Try: facebook/react, microsoft/vscode, or any public GitHub repo
          </p>
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
              <div className="flex gap-3">
                <Link
                  href="/analytics"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  📊 View Analytics
                </Link>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
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
                    {contributor.user_details?.location && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium text-gray-600 truncate">
                          {contributor.user_details.location}
                        </span>
                      </div>
                    )}
                  </div>

                  {contributor.user_details && (
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full mb-3 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      {showDetails ? "Hide" : "Show"} Details
                    </button>
                  )}

                  {showDetails && contributor.user_details && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border space-y-2 text-sm h-[160px] overflow-y-auto">
                      {contributor.user_details.email && (
                        <div className="flex items-center gap-2">
                          <span>📧</span>
                          <a
                            href={`mailto:${contributor.user_details.email}`}
                            className="text-blue-600 hover:underline truncate"
                          >
                            {contributor.user_details.email}
                          </a>
                        </div>
                      )}
                      {contributor.user_details.bio && (
                        <p className="text-gray-700 text-xs">
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
                          <span className="text-gray-700 truncate">
                            {contributor.user_details.company}
                          </span>
                        </div>
                      )}
                      {contributor.user_details.location && (
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="text-gray-700 truncate">
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
                          <span className="font-medium text-gray-900">
                            {contributor.user_details.public_repos.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {contributor.user_details.followers !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Followers:</span>
                          <span className="font-medium text-gray-900">
                            {contributor.user_details.followers.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {contributor.user_details.following !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Following:</span>
                          <span className="font-medium text-gray-900">
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
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Generate Thank You
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
        <div className="text-center mt-12 text-gray-500">
          <p>Built with ❤️ for the open-source community</p>
        </div>
      </div>
    </div>
  );
}
