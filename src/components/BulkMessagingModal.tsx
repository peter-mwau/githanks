"use client";

import { useState } from "react";
import { EnhancedContributor } from "@/lib/types";

interface BulkMessagingModalProps {
  contributors: EnhancedContributor[];
  repositoryName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface BulkMessageResponse {
  messages: Array<{
    message: string;
    tweetMessage?: string;
    contributor?: EnhancedContributor;
  }>;
  tweetUrl?: string;
  sentCount: number;
  totalCount: number;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface TweetOptions {
  includeNonTwitterUsers: boolean;
  tweetStyle: "simple" | "detailed" | "enthusiastic";
}

export default function BulkMessagingModal({
  contributors,
  repositoryName,
  isOpen,
  onClose,
}: BulkMessagingModalProps) {
  const [filterCriteria, setFilterCriteria] = useState({
    location: "",
    minContributions: 0,
    maxContributions: 100000,
  });
  const [style, setStyle] = useState<
    "professional" | "casual" | "enthusiastic" | "ai-generated"
  >("ai-generated");
  const [includeStats, setIncludeStats] = useState(true);
  const [sendMessages, setSendMessages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkMessageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugTweet, setDebugTweet] = useState<string | null>(null);

  // New Twitter options state
  const [tweetOptions, setTweetOptions] = useState<TweetOptions>({
    includeNonTwitterUsers: false,
    tweetStyle: "detailed",
  });

  const handleBulkGenerate = async () => {
    if (filteredContributors.length === 0) {
      setError("No contributors match the filter criteria");
      return;
    }

    if (!repositoryName) {
      setError("Repository name is required");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        contributors: filteredContributors,
        repositoryName: repositoryName,
        style,
        includeStats,
        filterCriteria:
          filterCriteria.location ||
          filterCriteria.minContributions > 0 ||
          filterCriteria.maxContributions < 100000
            ? filterCriteria
            : undefined,
        sendMessages,
        tweetOptions,
      };

      console.log("Sending bulk message request:", payload);

      const response = await fetch("/api/ai/generate-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: APIResponse<BulkMessageResponse> = await response.json();

      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (data.success && data.data) {
        setResult(data.data);

        // Debug: Decode the tweet URL to see the actual message
        if (data.data.tweetUrl) {
          const tweetUrl = data.data.tweetUrl;
          const tweetText = decodeURIComponent(
            tweetUrl.split("text=")[1] || ""
          );
          setDebugTweet(tweetText);
          console.log("Generated Tweet:", tweetText);
          console.log("Tweet Length:", tweetText.length);
          console.log("Tweet URL:", tweetUrl);
        }
      } else {
        const errorMessage = data.error || "Unknown error occurred";
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Request Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate messages";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter contributors based on criteria
  const filteredContributors = contributors.filter((contributor) => {
    if (filterCriteria.location && contributor.user_details?.location) {
      const contributorLocation =
        contributor.user_details.location.toLowerCase();
      const targetLocation = filterCriteria.location.toLowerCase();
      if (!contributorLocation.includes(targetLocation)) return false;
    }

    if (contributor.contributions < filterCriteria.minContributions)
      return false;
    if (contributor.contributions > filterCriteria.maxContributions)
      return false;

    return true;
  });

  // Calculate Twitter stats for the UI
  const twitterStats = {
    withTwitter: filteredContributors.filter(
      (c) => c.user_details?.twitter_username
    ).length,
    withoutTwitter: filteredContributors.filter(
      (c) => !c.user_details?.twitter_username
    ).length,
    totalContributions: filteredContributors.reduce(
      (sum, c) => sum + c.contributions,
      0
    ),
    topContributor:
      filteredContributors.length > 0
        ? filteredContributors.reduce((prev, current) =>
            prev.contributions > current.contributions ? prev : current
          )
        : null,
  };

  const clearError = () => setError(null);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Bulk Messaging
              </h2>
              <p className="text-gray-600 mt-1">
                Generate and send messages to multiple contributors
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
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
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
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
            </div>
          )}

          {/* Repository Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Repository</h3>
            <p className="text-blue-700">
              {repositoryName || "No repository selected"}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Total contributors: {contributors.length}
            </p>
          </div>

          {/* Filter Criteria */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Filter Contributors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Location
                </label>
                <input
                  type="text"
                  value={filterCriteria.location}
                  onChange={(e) => {
                    setFilterCriteria((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }));
                    clearError();
                  }}
                  placeholder="e.g., New York, San Francisco"
                  className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Contributions
                </label>
                <input
                  type="number"
                  min="0"
                  value={filterCriteria.minContributions}
                  onChange={(e) => {
                    setFilterCriteria((prev) => ({
                      ...prev,
                      minContributions: parseInt(e.target.value) || 0,
                    }));
                    clearError();
                  }}
                  className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Contributions
                </label>
                <input
                  type="number"
                  min="1"
                  value={filterCriteria.maxContributions}
                  onChange={(e) => {
                    setFilterCriteria((prev) => ({
                      ...prev,
                      maxContributions: parseInt(e.target.value) || 100000,
                    }));
                    clearError();
                  }}
                  className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Message Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Message Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Style
                </label>
                <select
                  value={style}
                  onChange={(e) => {
                    setStyle(
                      e.target.value as
                        | "ai-generated"
                        | "professional"
                        | "casual"
                        | "enthusiastic"
                    );
                    clearError();
                  }}
                  className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ai-generated">🤖 AI Generated</option>
                  <option value="professional">💼 Professional</option>
                  <option value="casual">😊 Casual</option>
                  <option value="enthusiastic">🎉 Enthusiastic</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeStats}
                    onChange={(e) => {
                      setIncludeStats(e.target.checked);
                      clearError();
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Include Contribution Stats
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sendMessages}
                    onChange={(e) => {
                      setSendMessages(e.target.checked);
                      clearError();
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Send Messages Directly (via email)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Twitter Settings */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
              🐦 Twitter Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={tweetOptions.includeNonTwitterUsers}
                    onChange={(e) => {
                      setTweetOptions((prev) => ({
                        ...prev,
                        includeNonTwitterUsers: e.target.checked,
                      }));
                      clearError();
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Mention contributors without Twitter
                  </span>
                </label>
                <p className="text-xs text-yellow-700 ml-6">
                  When checked, will use GitHub usernames for contributors
                  without Twitter handles
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-2">
                  Tweet Style
                </label>
                <select
                  value={tweetOptions.tweetStyle}
                  onChange={(e) => {
                    setTweetOptions((prev) => ({
                      ...prev,
                      tweetStyle: e.target.value as
                        | "simple"
                        | "detailed"
                        | "enthusiastic",
                    }));
                    clearError();
                  }}
                  className="w-full px-3 py-2 border text-gray-600 border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
                >
                  <option value="detailed">
                    📊 Detailed (with stats & impact)
                  </option>
                  <option value="enthusiastic">
                    🎉 Enthusiastic (energetic & celebratory)
                  </option>
                  <option value="simple">💫 Simple (short & sweet)</option>
                </select>
              </div>
            </div>

            {/* Twitter Stats */}
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-yellow-900 mb-2">
                Twitter Mention Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">With Twitter:</span>
                  <span className="ml-1 font-medium text-green-600">
                    {twitterStats.withTwitter}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Without Twitter:</span>
                  <span className="ml-1 font-medium text-orange-600">
                    {twitterStats.withoutTwitter}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Mentions:</span>
                  <span className="ml-1 font-medium text-blue-600">
                    {Math.min(
                      twitterStats.withTwitter +
                        (tweetOptions.includeNonTwitterUsers
                          ? twitterStats.withoutTwitter
                          : 0),
                      10
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Commits:</span>
                  <span className="ml-1 font-medium text-purple-600">
                    {twitterStats.totalContributions}
                  </span>
                </div>
              </div>
              {twitterStats.topContributor && (
                <p className="text-xs text-gray-600 mt-2">
                  Top contributor:{" "}
                  {twitterStats.topContributor.user_details?.name ||
                    twitterStats.topContributor.login}
                  ({twitterStats.topContributor.contributions} commits)
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
            <p className="text-sm text-gray-600">
              Will process <strong>{filteredContributors.length}</strong> out of{" "}
              {contributors.length} contributors
              {filterCriteria.location &&
                ` from location containing "${filterCriteria.location}"`}
              {(filterCriteria.minContributions > 0 ||
                filterCriteria.maxContributions < 100000) && (
                <span>
                  {" with "}
                  {filterCriteria.minContributions > 0 &&
                    `at least ${filterCriteria.minContributions} contributions`}
                  {filterCriteria.minContributions > 0 &&
                    filterCriteria.maxContributions < 100000 &&
                    " and "}
                  {filterCriteria.maxContributions < 100000 &&
                    `up to ${filterCriteria.maxContributions} contributions`}
                </span>
              )}
            </p>
            {filteredContributors.length === 0 && (
              <p className="text-red-600 text-sm mt-2">
                No contributors match your criteria. Please adjust your filters.
              </p>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Success! 🎉</h3>
              <div className="space-y-2 text-sm text-green-700">
                <p>
                  ✅ Generated {result.messages.length} personalized messages
                </p>
                {result.sentCount > 0 && (
                  <p>✅ Sent {result.sentCount} direct messages via email</p>
                )}
                <p>✅ Processed {result.totalCount} contributors total</p>
              </div>
              {result.tweetUrl && (
                <div className="mt-3">
                  <a
                    href={result.tweetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                  >
                    🐦 Post Thank You Tweet
                  </a>
                  <p className="text-xs text-gray-600 mt-1">
                    This will open Twitter with a detailed thank you message
                    mentioning contributors
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Debug Section */}
          {process.env.NODE_ENV === "development" && debugTweet && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">
                🐛 Debug Information
              </h4>

              <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-purple-700">Include Non-Twitter:</span>
                  <span className="ml-2 font-medium text-gray-600">
                    {tweetOptions.includeNonTwitterUsers ? "Yes" : "No"}
                  </span>
                </div>
                <div>
                  <span className="text-purple-700">Tweet Style:</span>
                  <span className="ml-2 font-medium text-gray-600">
                    {tweetOptions.tweetStyle}
                  </span>
                </div>
                <div>
                  <span className="text-purple-700">
                    Contributors with Twitter:
                  </span>
                  <span className="ml-2 font-medium text-pink-500">
                    {twitterStats.withTwitter}
                  </span>
                </div>
                <div>
                  <span className="text-purple-700">
                    Contributors without Twitter:
                  </span>
                  <span className="ml-2 text-yellow-500 font-medium">
                    {twitterStats.withoutTwitter}
                  </span>
                </div>
              </div>

              <p className="text-sm text-purple-700 mb-2">
                Tweet Length: <strong>{debugTweet.length}</strong>/280
                characters
              </p>

              <div className="bg-white p-3 text-gray-600 rounded border text-sm font-mono whitespace-pre-wrap">
                {debugTweet}
              </div>

              <p className="text-xs text-purple-600 mt-2">
                Mentions found: {(debugTweet.match(/@\w+/g) || []).join(", ")}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkGenerate}
              disabled={
                loading || filteredContributors.length === 0 || !repositoryName
              }
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                `Generate ${filteredContributors.length} Messages`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
