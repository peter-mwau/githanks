"use client";

import { useState, useEffect } from "react";
import {
  BarChartComponent,
  PieChartComponent,
  LineChartComponent,
} from "@/components/Charts";
import {
  analyzeContributors,
  generateContributorRankings,
  AnalyticsData,
} from "@/lib/analytics";
import { useRepository } from "@/contexts/RepositoryContext";
import {
  Users,
  MapPin,
  Code,
  Star,
  TrendingUp,
  Building,
  Globe,
  Award,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import type { RankedContributor } from "@/lib/types";

interface AnalyticsPageProps {
  setCurrentPage?: Dispatch<SetStateAction<string>>;
}

export default function AnalyticsPage({ setCurrentPage }: AnalyticsPageProps) {
  const {
    repository,
    contributors,
    allContributors,
    loading,
    error,
    fetchAllContributors,
  } = useRepository();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [rankings, setRankings] = useState<ReturnType<
    typeof generateContributorRankings
  > | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleGoHome = () => {
    if (setCurrentPage) {
      setCurrentPage("home");
    } else {
      // Fallback: use Next.js navigation if setCurrentPage is not available
      window.location.href = "/";
    }
  };

  // Fetch all contributors when component mounts and repository is available
  useEffect(() => {
    if (repository && allContributors.length === 0 && !loading) {
      console.log("Fetching all contributors for analytics...");
      fetchAllContributors();
    }
  }, [repository, allContributors.length, loading, fetchAllContributors]);

  // Generate analytics when contributors change
  useEffect(() => {
    const contributorsToUse =
      allContributors.length > 0 ? allContributors : contributors;
    if (contributorsToUse.length > 0 && repository) {
      console.log(
        `Generating analytics for ${contributorsToUse.length} contributors`
      );
      const analyticsData = analyzeContributors(contributorsToUse, repository);
      setAnalytics(analyticsData);

      const rankingsData = generateContributorRankings(contributorsToUse);
      setRankings(rankingsData);
    }
  }, [contributors, allContributors, repository]);

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "rankings", label: "Rankings", icon: Award },
    { id: "companies", label: "Companies", icon: Building },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold  mb-4 dark:text-gray-400">
            📊 Repository Analytics
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Deep insights into your repository&apos;s contributor ecosystem
          </p>
        </div>

        {/* No Repository State */}
        {!repository && !loading && (
          <div className="text-center py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30">
            <Globe className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              No Repository Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-md mx-auto">
              Please go to the home page and enter a GitHub repository URL to
              analyze contributor data
            </p>
            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go to Home Page
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-6"></div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Loading Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Analyzing repository data and generating insights...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-8 border border-red-200/50 dark:border-red-800/30">
            <div className="p-4 bg-red-100/50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-800 dark:text-red-200 text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Repository Info */}
        {repository && (
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-white/20 dark:border-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 lg:mb-0">
                {repository.full_name}
              </h2>
              <div className="flex items-center space-x-6 text-base text-gray-600 dark:text-gray-400">
                <span className="flex items-center bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  {repository.stargazers_count?.toLocaleString()}
                </span>
                <span className="flex items-center bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
                  <Users className="w-5 h-5 mr-2 text-blue-500" />
                  {allContributors.length > 0
                    ? allContributors.length
                    : contributors.length}{" "}
                  contributors
                </span>
              </div>
            </div>
            {repository.description && (
              <p className="text-gray-700 dark:text-gray-300 text-lg bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                {repository.description}
              </p>
            )}
          </div>
        )}

        {/* Analytics Dashboard */}
        {analytics && (
          <>
            {/* Tab Navigation */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl mb-8 border border-white/20 dark:border-gray-700/30">
              <div className="border-b border-gray-200/50 dark:border-gray-700/50">
                <nav className="flex flex-wrap space-x-2 lg:space-x-8 px-6">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-3 lg:px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600 dark:text-blue-400"
                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="whitespace-nowrap">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 lg:p-8">
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm font-medium">
                              Total Contributors
                            </p>
                            <p className="text-3xl font-bold mt-2">
                              {analytics.contributorStats.total}
                            </p>
                          </div>
                          <Users className="w-10 h-10 text-blue-200 opacity-80" />
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm font-medium">
                              Total Lines Added
                            </p>
                            <p className="text-3xl font-bold mt-2">
                              {analytics.contributorStats.totalLinesAdded.toLocaleString()}
                            </p>
                          </div>
                          <Code className="w-10 h-10 text-green-200 opacity-80" />
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm font-medium">
                              Avg Contributions
                            </p>
                            <p className="text-3xl font-bold mt-2">
                              {Math.round(
                                analytics.contributorStats.avgContributions
                              )}
                            </p>
                          </div>
                          <TrendingUp className="w-10 h-10 text-purple-200 opacity-80" />
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-100 text-sm font-medium">
                              With Location
                            </p>
                            <p className="text-3xl font-bold mt-2">
                              {analytics.contributorStats.withLocation}
                            </p>
                          </div>
                          <MapPin className="w-10 h-10 text-orange-200 opacity-80" />
                        </div>
                      </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                        <BarChartComponent
                          data={analytics.contributionsByTopContributors}
                          title="Top Contributors"
                          dataKey="value"
                          xAxisKey="name"
                          height={350}
                        />
                      </div>
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                        <LineChartComponent
                          data={analytics.activityOverTime}
                          title="Activity Over Time"
                          dataKey="value"
                          xAxisKey="name"
                          height={350}
                        />
                      </div>
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                        <PieChartComponent
                          data={analytics.languageDistribution}
                          title="Language Distribution"
                          dataKey="value"
                          height={350}
                        />
                      </div>
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                        <BarChartComponent
                          data={analytics.linesOfCodeByContributor}
                          title="Lines of Code by Contributor"
                          dataKey="value"
                          xAxisKey="name"
                          height={350}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "locations" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                        <BarChartComponent
                          data={analytics.contributionsByLocation}
                          title="Contributions by Location"
                          dataKey="value"
                          xAxisKey="name"
                          height={400}
                        />
                      </div>
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                          Top Countries
                        </h3>
                        <div className="space-y-4">
                          {analytics.topCountries.map((country, index) => (
                            <div
                              key={country.name}
                              className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {country.name}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {country.contributors.length} contributors
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white text-lg">
                                  {country.value}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  contributions
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "rankings" && rankings && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Top by Contributions */}
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                          <Award className="w-6 h-6 mr-3 text-yellow-500" />
                          Top by Contributions
                        </h3>
                        <div className="space-y-4">
                          {rankings.byContributions
                            .slice(0, 10)
                            .map((contributor: RankedContributor) => (
                              <div
                                key={contributor.login}
                                className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-bold">
                                  {contributor.rank}
                                </div>
                                <Image
                                  src={contributor.avatar_url || "/window.svg"}
                                  alt={contributor.login}
                                  width={48}
                                  height={48}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white/50 dark:border-gray-600/50"
                                  onError={(e) => {
                                    e.currentTarget.src = "/window.svg";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {contributor.user_details?.name ||
                                      contributor.login}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {contributor.contributions} contributions
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Top by Lines Added */}
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                          <Code className="w-6 h-6 mr-3 text-green-500" />
                          Top by Lines Added
                        </h3>
                        <div className="space-y-4">
                          {rankings.byLinesAdded
                            .slice(0, 10)
                            .map((contributor: RankedContributor) => (
                              <div
                                key={contributor.login}
                                className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-bold">
                                  {contributor.rank}
                                </div>
                                <Image
                                  src={contributor.avatar_url || "/window.svg"}
                                  alt={contributor.login}
                                  width={48}
                                  height={48}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white/50 dark:border-gray-600/50"
                                  onError={(e) => {
                                    e.currentTarget.src = "/window.svg";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {contributor.user_details?.name ||
                                      contributor.login}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    +{contributor.lines_added?.toLocaleString()}{" "}
                                    lines
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                          <TrendingUp className="w-6 h-6 mr-3 text-blue-500" />
                          Recent Activity
                        </h3>
                        <div className="space-y-4">
                          {rankings.byRecentActivity
                            .slice(0, 10)
                            .map((contributor: RankedContributor) => (
                              <div
                                key={contributor.login}
                                className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold">
                                  {contributor.rank}
                                </div>
                                <Image
                                  src={contributor.avatar_url || "/window.svg"}
                                  alt={contributor.login}
                                  width={48}
                                  height={48}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-white/50 dark:border-gray-600/50"
                                  onError={(e) => {
                                    e.currentTarget.src = "/window.svg";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {contributor.user_details?.name ||
                                      contributor.login}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {contributor.last_contribution
                                      ? new Date(
                                          contributor.last_contribution
                                        ).toLocaleDateString()
                                      : "Unknown"}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "companies" && (
                  <div className="space-y-8">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 flex items-center">
                        <Building className="w-7 h-7 mr-3 text-indigo-500" />
                        Top Contributing Companies
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {analytics.topCompanies.map((company, index) => (
                          <div
                            key={company.name}
                            className="border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 bg-white/50 dark:bg-gray-800/50 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-base font-bold">
                                  {index + 1}
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                  {company.name}
                                </h4>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white text-xl">
                                  {company.value}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  contributions
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p className="mb-3 font-medium">
                                Top contributors:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {company.contributors.map(
                                  (contributor, idx) => (
                                    <span
                                      key={idx}
                                      className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium"
                                    >
                                      {contributor}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
