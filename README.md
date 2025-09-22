# 🙏 GitThanks

> **AI-Powered Appreciation for Open-Source Contributors**

GitThanks is a Next.js application that helps open-source maintainers automatically discover, analyze, and appreciate their contributors using AI-powered insights and personalized messaging.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 🚀 Features

- **🔍 Smart Discovery**: Automatically fetch all contributors from any GitHub repository
- **🔎 Hybrid Search**: Use Elasticsearch to search, rank, and filter contributors by various criteria
- **🤖 AI-Powered Messages**: Generate personalized thank-you messages using Google Gemini AI
- **📊 Contributor Analytics**: View detailed contributor statistics and insights
- **🐦 Social Sharing**: One-click Twitter integration to publicly appreciate contributors
- **📱 Responsive Design**: Beautiful, mobile-first UI built with Tailwind CSS

## 🏗️ Architecture

```
Frontend (Next.js + Tailwind CSS)
         ↓
GitHub API + GraphQL → Contributor Data
         ↓
Elastic Cloud → Hybrid Search & Analytics
         ↓
Google Vertex AI (Gemini) → AI Message Generation
         ↓
Twitter/X API → Social Sharing
```

## 🛠️ Tech Stack

| Layer            | Technologies                         |
| ---------------- | ------------------------------------ |
| **Frontend**     | Next.js 15, TypeScript, Tailwind CSS |
| **APIs**         | GitHub REST & GraphQL APIs           |
| **Search**       | Elasticsearch (Elastic Cloud)        |
| **AI**           | Google Cloud Vertex AI (Gemini Pro)  |
| **Deployment**   | Google Cloud Run (Serverless)        |
| **Integrations** | Twitter/X API                        |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- GitHub Personal Access Token
- Google Cloud Account (for Vertex AI)
- Elasticsearch Cloud Account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/peter-mwau/githanks.git
   cd githanks
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   # GitHub API
   GITHUB_TOKEN=your_github_personal_access_token

   # Google Cloud Vertex AI
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json

   # Elasticsearch
   ELASTICSEARCH_CLOUD_ID=your_cloud_id
   ELASTICSEARCH_API_KEY=your_api_key

   # Twitter API (Optional)
   TWITTER_API_KEY=your_api_key
   TWITTER_API_SECRET=your_api_secret
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage

1. **Enter Repository URL**: Input any GitHub repository URL (e.g., `owner/repository`)
2. **View Contributors**: Automatically fetched contributor list with detailed statistics
3. **Search & Filter**: Use hybrid search to find specific contributors or filter by criteria
4. **Generate Messages**: Click "Generate Thank You" for AI-powered personalized messages
5. **Share Appreciation**: Tweet your thanks or copy messages for other platforms

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**

   ```bash
   git clone https://github.com/your-username/githanks.git
   cd githanks
   ```

3. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make your changes** and commit

   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to your branch**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request** on GitHub

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code passes linting: `npm run lint`

### Code Style

This project uses:

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Tailwind CSS for styling

## 🗺️ Roadmap

### MVP (Current - 2 weeks)

- ✅ GitHub API integration
- ✅ Basic contributor fetching
- ✅ Next.js frontend with Tailwind CSS
- 🔄 Elasticsearch integration
- 🔄 Google Gemini AI integration
- 🔄 Basic search and filtering
- 🔄 Message generation

### Future Features

- ⭐ Sentiment analysis of commit messages
- ⭐ Auto-classification of contributor roles
- ⭐ AI recommendations for collaboration
- ⭐ Advanced analytics dashboard
- ⭐ Bulk message generation
- ⭐ Integration with more social platforms

## 📊 Project Status

This project is in **active development**. Current version: `0.1.0`

## 🐛 Issues & Support

- 🐛 **Bug Reports**: [Create an issue](https://github.com/peter-mwau/githanks/issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Request a feature](https://github.com/peter-mwau/githanks/issues/new?template=feature_request.md)
- 📧 **General Questions**: [Discussions](https://github.com/peter-mwau/githanks/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all open-source contributors who make projects like this possible
- GitHub for providing excellent APIs
- Google Cloud for AI capabilities
- Elastic for powerful search functionality
- The Next.js and React communities

## 🌟 Show Your Support

If you find GitThanks helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing code
- 📢 Sharing with others

---

**Built with ❤️ by the GitThanks team**

_Open-source thrives on collaboration—GitThanks makes appreciation effortless._
