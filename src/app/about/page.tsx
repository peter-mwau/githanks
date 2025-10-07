"use client";

import {
  Heart,
  Github,
  Users,
  Zap,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
interface AboutPageProps {
  setCurrentPage?: Dispatch<SetStateAction<string>>;
}

export default function AboutPage({ setCurrentPage }: AboutPageProps) {
  const handleGoHome = () => {
    if (setCurrentPage) {
      setCurrentPage("home");
    } else {
      // Fallback: use Next.js navigation if setCurrentPage is not available
      window.location.href = "/";
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
  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-500 dark:text-gray-400 mb-6">
            About{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              GitThanks
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            GitThanks is an AI-powered platform that helps open-source
            maintainers discover, analyze, and appreciate their contributors
            with personalized thank-you messages.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-12 border border-white/20 dark:border-gray-700/30">
          <div className="text-center mb-8">
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-4">
                Open-source software powers the modern world, built by
                passionate developers who contribute their time and expertise
                freely. Yet, recognition and appreciation for their work often
                gets lost in the vastness of code repositories.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                GitThanks bridges this gap by making it effortless for
                maintainers to discover, analyze, and personally thank their
                contributors at scale.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-100/50 to-purple-100/50 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur-sm p-6 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Why It Matters
              </h3>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-indigo-500 dark:text-indigo-400 mr-2">
                    •
                  </span>
                  Builds stronger open-source communities
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 dark:text-indigo-400 mr-2">
                    •
                  </span>
                  Encourages continued contribution
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 dark:text-indigo-400 mr-2">
                    •
                  </span>
                  Provides valuable project insights
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 dark:text-indigo-400 mr-2">
                    •
                  </span>
                  Saves maintainers time and effort
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl text-center border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <Github className="w-12 h-12 text-gray-700 dark:text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              GitHub Integration
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Seamlessly connect with any GitHub repository to fetch contributor
              data and history.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl text-center border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Advanced Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get detailed insights into contributor patterns, locations, and
              contribution trends.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl text-center border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              AI-Powered Messages
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate personalized thank-you messages using advanced AI
              technology.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl text-center border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Community Building
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Foster stronger relationships within your open-source community.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl text-center border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              One-Click Sharing
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share appreciation publicly on social media with a single click.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg p-6 rounded-2xl shadow-2xl text-center border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <BarChart3 className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Contributor Rankings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover top contributors by various metrics and engagement
              levels.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-12 border border-white/20 dark:border-gray-700/30">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Built With
          </h2>

          {/* Scrolling Container */}
          <div className="relative overflow-hidden">
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/80 dark:from-gray-900/80 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/80 dark:from-gray-900/80 to-transparent z-10"></div>

            {/* Scrolling Content */}
            <div className="flex space-x-8 animate-scroll-slow">
              {/* First Set - will be duplicated for seamless loop */}
              <div className="flex space-x-8 flex-none">
                {/* Next.js */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/nextjs-icon.svg"
                      alt="Next.js"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Next.js 15
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    React Framework
                  </p>
                </div>

                {/* TypeScript */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/typescript.svg"
                      alt="TypeScript"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    TypeScript
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type Safety
                  </p>
                </div>

                {/* Tailwind CSS */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/tailwindcss.svg"
                      alt="Tailwind CSS"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Tailwind CSS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Styling
                  </p>
                </div>

                {/* GitHub API */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/github.svg"
                      alt="GitHub API"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    GitHub API
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Data Source
                  </p>
                </div>

                {/* GraphQL */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/graphql.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    GraphQL
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    API Query
                  </p>
                </div>

                {/* REST API */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/system-settings.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    REST API
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    API Integration
                  </p>
                </div>

                {/* Lucide React */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/lucide.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Lucide React
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Icons
                  </p>
                </div>

                {/* Elasticsearch */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/elastic-search.svg"
                      alt="Elasticsearch"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Elasticsearch
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Search Engine
                  </p>
                </div>

                {/* Recharts */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/charts.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Recharts
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Data Visualization
                  </p>
                </div>

                {/* Gemini API */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/gemini.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Gemini API
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI Integration
                  </p>
                </div>

                {/* Octokit */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/ocktokit.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Octokit
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    GitHub SDK
                  </p>
                </div>
              </div>

              {/* Duplicated Set for Seamless Loop */}
              <div className="flex space-x-8 flex-none" aria-hidden="true">
                {/* Next.js */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/nextjs-icon.svg"
                      alt="Next.js"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Next.js 15
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    React Framework
                  </p>
                </div>

                {/* TypeScript */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/typescript.svg"
                      alt="TypeScript"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    TypeScript
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Type Safety
                  </p>
                </div>

                {/* Tailwind CSS */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/tailwindcss.svg"
                      alt="Tailwind CSS"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Tailwind CSS
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Styling
                  </p>
                </div>

                {/* GitHub API */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/github.svg"
                      alt="GitHub API"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    GitHub API
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Data Source
                  </p>
                </div>

                {/* GraphQL */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/graphql.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    GraphQL
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    API Query
                  </p>
                </div>

                {/* REST API */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/system-settings.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    REST API
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    API Integration
                  </p>
                </div>

                {/* Lucide React */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/lucide.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Lucide React
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Icons
                  </p>
                </div>

                {/* Elasticsearch */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/elastic-search.svg"
                      alt="Elasticsearch"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Elasticsearch
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Search Engine
                  </p>
                </div>

                {/* Recharts */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/charts.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Recharts
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Data Visualization
                  </p>
                </div>

                {/* Gemini API */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/gemini.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Gemini API
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI Integration
                  </p>
                </div>

                {/* Octokit */}
                <div className="text-center min-w-[120px]">
                  <div className="bg-gray-800 p-3 rounded-xl mb-3 shadow-lg">
                    <Image
                      src="/ocktokit.svg"
                      alt="GraphQL"
                      width={36}
                      height={36}
                      className="w-9 h-9 mx-auto"
                    />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Octokit
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    GitHub SDK
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <div className="bg-gray-900/80 text-white rounded-2xl shadow-2xl p-8 mb-12 border border-indigo-400/30">
          <h2 className="text-3xl font-bold text-center mb-8">
            Future Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
              <ul className="space-y-3">
                {/* <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">🚀</span>
                  Google Gemini AI integration for smarter messages
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">🔍</span>
                  Elasticsearch for advanced contributor search
                </li> */}
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">📊</span>
                  Sentiment analysis of commit messages
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">🤖</span>
                  Auto-classification of contributor roles
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Vision</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">💡</span>
                  AI recommendations for future collaboration
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">📈</span>
                  Advanced analytics dashboard
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">🌐</span>
                  Multi-platform social media integration
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">📱</span>
                  Mobile application
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Appreciate Your Contributors?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Start building stronger open-source communities today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleGoHome()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
            <button
              onClick={() => handleGoAnalytics}
              className="bg-white/50 dark:bg-gray-800/50 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-400 px-8 py-3 rounded-xl font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View Analytics
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p className="mb-2 text-lg">
            Made with ❤️ for the open-source community
          </p>
          <p className="text-sm">
            GitThanks • AI-Powered Contributor Appreciation
          </p>
        </div>
      </div>
    </div>
  );
}
