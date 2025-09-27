import Link from "next/link";
import {
  Heart,
  Github,
  Users,
  Zap,
  BarChart3,
  MessageSquare,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-indigo-600">GitThanks</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            GitThanks is an AI-powered platform that helps open-source
            maintainers discover, analyze, and appreciate their contributors
            with personalized thank-you messages.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Open-source software powers the modern world, built by
                passionate developers who contribute their time and expertise
                freely. Yet, recognition and appreciation for their work often
                gets lost in the vastness of code repositories.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                GitThanks bridges this gap by making it effortless for
                maintainers to discover, analyze, and personally thank their
                contributors at scale.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Why It Matters
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  Builds stronger open-source communities
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  Encourages continued contribution
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  Provides valuable project insights
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  Saves maintainers time and effort
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <Github className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              GitHub Integration
            </h3>
            <p className="text-gray-600">
              Seamlessly connect with any GitHub repository to fetch contributor
              data and history.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Advanced Analytics
            </h3>
            <p className="text-gray-600">
              Get detailed insights into contributor patterns, locations, and
              contribution trends.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI-Powered Messages
            </h3>
            <p className="text-gray-600">
              Generate personalized thank-you messages using advanced AI
              technology.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Community Building
            </h3>
            <p className="text-gray-600">
              Foster stronger relationships within your open-source community.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              One-Click Sharing
            </h3>
            <p className="text-gray-600">
              Share appreciation publicly on social media with a single click.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <BarChart3 className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Contributor Rankings
            </h3>
            <p className="text-gray-600">
              Discover top contributors by various metrics and engagement
              levels.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Built With
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-black text-white p-4 rounded-lg mb-3">
                <span className="text-2xl font-bold">▲</span>
              </div>
              <p className="font-medium text-gray-900">Next.js 15</p>
              <p className="text-sm text-gray-600">React Framework</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white p-4 rounded-lg mb-3">
                <span className="text-2xl font-bold">TS</span>
              </div>
              <p className="font-medium text-gray-900">TypeScript</p>
              <p className="text-sm text-gray-600">Type Safety</p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-500 text-white p-4 rounded-lg mb-3">
                <span className="text-2xl font-bold">TW</span>
              </div>
              <p className="font-medium text-gray-900">Tailwind CSS</p>
              <p className="text-sm text-gray-600">Styling</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-800 text-white p-4 rounded-lg mb-3">
                <span className="text-2xl font-bold">GH</span>
              </div>
              <p className="font-medium text-gray-900">GitHub API</p>
              <p className="text-sm text-gray-600">Data Source</p>
            </div>
          </div>
        </div>

        {/* Roadmap */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            Future Roadmap
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Coming Soon</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">🚀</span>
                  Google Gemini AI integration for smarter messages
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">🔍</span>
                  Elasticsearch for advanced contributor search
                </li>
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
        <div className="text-center bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Appreciate Your Contributors?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start building stronger open-source communities today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/analytics"
              className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              View Analytics
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="mb-2">Made with ❤️ for the open-source community</p>
          <p className="text-sm">
            GitThanks • AI-Powered Contributor Appreciation
          </p>
        </div>
      </div>
    </div>
  );
}
