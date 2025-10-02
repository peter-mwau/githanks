"use client";

import { useState } from "react";

interface RepositorySearchFormProps {
  repositoryUrl: string;
  setRepositoryUrl: (url: string) => void;
  loading: boolean;
  error: string | null;
  enhanced: boolean;
  setEnhanced: (enhanced: boolean) => void;
  onSubmit: () => Promise<void>;
  clearError: () => void;
}

export default function RepositorySearchForm({
  repositoryUrl,
  setRepositoryUrl,
  loading,
  error,
  enhanced,
  setEnhanced,
  onSubmit,
  clearError,
}: RepositorySearchFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repositoryUrl.trim()) return;
    clearError();
    await onSubmit();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
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
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enhanced Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900">
                {enhanced ? "🔍 Enhanced Mode" : "⚡ Basic Mode"}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
            <span className="sr-only">Toggle enhanced mode</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enhanced ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Repository URL Input */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Loading..." : "Fetch Contributors"}
        </button>
      </form>

      {/* Error Details */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
          <div className="mt-2 text-sm text-red-600">
            <p>Make sure you:</p>
            <ul className="list-disc list-inside ml-4">
              <li>Enter a valid GitHub repository URL</li>
              <li>Check that the repository exists and is public</li>
              <li>Verify your GitHub token is set in environment variables</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}