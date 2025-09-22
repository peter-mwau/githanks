# Contributing to GitThanks

First off, thank you for considering contributing to GitThanks! 🎉 It's people like you that make GitThanks such a great tool for appreciating open-source contributors.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find that the problem has already been reported. When you create a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS, Node.js version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some other projects where this enhancement exists, if applicable**

### Pull Requests

1. **Fork the repository** and create your branch from `master`
2. **Install dependencies**: `npm install`
3. **Make your changes** in a feature branch
4. **Add tests** if applicable
5. **Ensure the test suite passes**: `npm test`
6. **Make sure your code lints**: `npm run lint`
7. **Update documentation** if needed
8. **Commit your changes** using conventional commit format
9. **Push to your fork** and submit a pull request

## Development Setup

### Prerequisites

- Node.js 18 or later
- npm, yarn, pnpm, or bun
- Git

### Local Development

1. Clone your fork:

   ```bash
   git clone https://github.com/your-username/githanks.git
   cd githanks
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Style Guidelines

### Git Commit Messages

We use [Conventional Commits](https://conventionalcommits.org/). Please format your commit messages as:

```
type(scope): subject

body

footer
```

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**

```
feat(search): add hybrid search functionality
fix(api): handle GitHub API rate limiting
docs(readme): update installation instructions
```

### TypeScript Guidelines

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React/Next.js Guidelines

- Use functional components with hooks
- Follow React best practices
- Use Next.js App Router conventions
- Implement proper error boundaries
- Use server components where appropriate

### CSS/Styling Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use semantic HTML elements

## Testing

- Write tests for new features
- Update tests when modifying existing functionality
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Documentation

- Update README.md if you change functionality
- Add JSDoc comments for new functions/components
- Update API documentation if applicable
- Include examples in documentation

## Questions?

Feel free to open an issue with the `question` label or start a discussion in our [GitHub Discussions](https://github.com/peter-mwau/githanks/discussions).

Thank you for contributing! 🙏
