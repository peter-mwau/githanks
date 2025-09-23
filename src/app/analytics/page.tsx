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
import Link from "next/link";

export default function AnalyticsPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Repository Analytics
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Deep insights into your repository&apos;s contributor ecosystem
          </p>
        </div>

        {/* No Repository State */}
        {!repository && !loading && (
          <div className="text-center py-16 bg-white rounded-lg shadow-lg">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Repository Selected
            </h3>
            <p className="text-gray-600 mb-6">
              Please go to the home page and enter a GitHub repository URL to
              analyze contributor data
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Home Page
            </Link>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16 bg-white rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading Analytics
            </h3>
            <p className="text-gray-600">
              Analyzing repository data and generating insights...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Repository Info */}
        {repository && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {repository.full_name}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  {repository.stargazers_count?.toLocaleString()}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {allContributors.length > 0
                    ? allContributors.length
                    : contributors.length}{" "}
                  contributors
                </span>
              </div>
            </div>
            {repository.description && (
              <p className="text-gray-600">{repository.description}</p>
            )}
          </div>
        )}

        {/* Analytics Dashboard */}
        {analytics && (
          <>
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-lg mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm">
                              Total Contributors
                            </p>
                            <p className="text-3xl font-bold">
                              {analytics.contributorStats.total}
                            </p>
                          </div>
                          <Users className="w-8 h-8 text-blue-200" />
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm">
                              Total Lines Added
                            </p>
                            <p className="text-3xl font-bold">
                              {analytics.contributorStats.totalLinesAdded.toLocaleString()}
                            </p>
                          </div>
                          <Code className="w-8 h-8 text-green-200" />
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm">
                              Avg Contributions
                            </p>
                            <p className="text-3xl font-bold">
                              {Math.round(
                                analytics.contributorStats.avgContributions
                              )}
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-purple-200" />
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-100 text-sm">
                              With Location
                            </p>
                            <p className="text-3xl font-bold">
                              {analytics.contributorStats.withLocation}
                            </p>
                          </div>
                          <MapPin className="w-8 h-8 text-orange-200" />
                        </div>
                      </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <BarChartComponent
                        data={analytics.contributionsByTopContributors}
                        title="Top Contributors"
                        dataKey="value"
                        xAxisKey="name"
                        height={350}
                      />
                      <LineChartComponent
                        data={analytics.activityOverTime}
                        title="Activity Over Time"
                        dataKey="value"
                        xAxisKey="name"
                        height={350}
                      />
                      <PieChartComponent
                        data={analytics.languageDistribution}
                        title="Language Distribution"
                        dataKey="value"
                        height={350}
                      />
                      <BarChartComponent
                        data={analytics.linesOfCodeByContributor}
                        title="Lines of Code by Contributor"
                        dataKey="value"
                        xAxisKey="name"
                        height={350}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "locations" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <BarChartComponent
                        data={analytics.contributionsByLocation}
                        title="Contributions by Location"
                        dataKey="value"
                        xAxisKey="name"
                        height={400}
                      />
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Top Countries
                        </h3>
                        <div className="space-y-4">
                          {analytics.topCountries.map((country, index) => (
                            <div
                              key={country.name}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {country.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {country.contributors.length} contributors
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">
                                  {country.value}
                                </p>
                                <p className="text-sm text-gray-600">
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
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Award className="w-5 h-5 mr-2 text-yellow-500" />
                          Top by Contributions
                        </h3>
                        <div className="space-y-3">
                          {rankings.byContributions
                            .slice(0, 10)
                            .map((contributor: any) => (
                              <div
                                key={contributor.login}
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                                  {contributor.rank}
                                </div>
                                <img
                                  src={contributor.avatar_url}
                                  alt={contributor.login}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {contributor.user_details?.name ||
                                      contributor.login}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {contributor.contributions} contributions
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Top by Lines Added */}
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Code className="w-5 h-5 mr-2 text-green-500" />
                          Top by Lines Added
                        </h3>
                        <div className="space-y-3">
                          {rankings.byLinesAdded
                            .slice(0, 10)
                            .map((contributor: any) => (
                              <div
                                key={contributor.login}
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                  {contributor.rank}
                                </div>
                                <img
                                  src={contributor.avatar_url}
                                  alt={contributor.login}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {contributor.user_details?.name ||
                                      contributor.login}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    +{contributor.lines_added?.toLocaleString()}{" "}
                                    lines
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                          Recent Activity
                        </h3>
                        <div className="space-y-3">
                          {rankings.byRecentActivity
                            .slice(0, 10)
                            .map((contributor: any) => (
                              <div
                                key={contributor.login}
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                  {contributor.rank}
                                </div>
                                <img
                                  src={contributor.avatar_url}
                                  alt={contributor.login}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {contributor.user_details?.name ||
                                      contributor.login}
                                  </p>
                                  <p className="text-xs text-gray-600">
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
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <Building className="w-5 h-5 mr-2 text-indigo-500" />
                        Top Contributing Companies
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {analytics.topCompanies.map((company, index) => (
                          <div
                            key={company.name}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold">
                                  {index + 1}
                                </div>
                                <h4 className="font-medium text-gray-900">
                                  {company.name}
                                </h4>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">
                                  {company.value}
                                </p>
                                <p className="text-sm text-gray-600">
                                  contributions
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p className="mb-2">Top contributors:</p>
                              <div className="flex flex-wrap gap-1">
                                {company.contributors.map(
                                  (contributor, idx) => (
                                    <span
                                      key={idx}
                                      className="bg-gray-100 px-2 py-1 rounded text-xs"
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
