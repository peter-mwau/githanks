# Security Policy

## Supported Versions

We actively support the following versions of GitThanks with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

The GitThanks team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing the maintainers directly. Include the following information:

- **Type of issue** (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s) related to the manifestation of the issue**
- **The location of the affected source code** (tag/branch/commit or direct URL)
- **Any special configuration required to reproduce the issue**
- **Step-by-step instructions to reproduce the issue**
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit the issue

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Initial Assessment**: We will provide an initial assessment of the vulnerability within 5 business days.
- **Regular Updates**: We will keep you informed of our progress toward resolving the issue.
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days of the initial report.

### Security Best Practices

When using GitThanks, please follow these security best practices:

1. **API Keys**: Never commit API keys or secrets to version control
2. **Environment Variables**: Use environment variables for sensitive configuration
3. **Dependencies**: Keep dependencies up to date and regularly audit for vulnerabilities
4. **Access Control**: Implement proper access controls for your deployment
5. **HTTPS**: Always use HTTPS in production environments

### Responsible Disclosure

We follow responsible disclosure practices:

- We will work with you to understand and resolve the issue
- We will acknowledge your contribution in our security advisories (unless you prefer to remain anonymous)
- We will coordinate public disclosure timing to ensure users have time to update

## Security Updates

Security updates will be released as patch versions and announced through:

- GitHub Security Advisories
- Release notes in our CHANGELOG.md
- Updates to this security policy

Thank you for helping keep GitThanks and our users safe!
