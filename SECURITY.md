# Security Policy

## Supported Versions

We actively support the following versions of TokNxr with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of TokNxr seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Create a Public Issue

Please **do not** create a public GitHub issue for security vulnerabilities. This could put users at risk.

### 2. Report Privately

Send an email to **security@toknxr.com** with the following information:

- **Subject**: Security Vulnerability Report
- **Description**: Detailed description of the vulnerability
- **Steps to Reproduce**: Clear steps to reproduce the issue
- **Impact**: Potential impact and severity assessment
- **Affected Versions**: Which versions are affected
- **Suggested Fix**: If you have suggestions for fixing the issue

### 3. Response Timeline

- **Initial Response**: Within 24 hours
- **Assessment**: Within 72 hours
- **Fix Timeline**: Depends on severity (see below)

## Severity Levels

### Critical (CVSS 9.0-10.0)
- **Response Time**: Immediate (within 24 hours)
- **Fix Timeline**: Within 7 days
- **Examples**: Remote code execution, authentication bypass

### High (CVSS 7.0-8.9)
- **Response Time**: Within 24 hours
- **Fix Timeline**: Within 14 days
- **Examples**: Privilege escalation, data exposure

### Medium (CVSS 4.0-6.9)
- **Response Time**: Within 72 hours
- **Fix Timeline**: Within 30 days
- **Examples**: Information disclosure, denial of service

### Low (CVSS 0.1-3.9)
- **Response Time**: Within 1 week
- **Fix Timeline**: Next minor release
- **Examples**: Minor information leaks, low-impact issues

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version of TokNxr
2. **Secure API Keys**: Store API keys in environment variables, never in code
3. **Network Security**: Use HTTPS for all communications
4. **Access Control**: Limit access to the TokNxr dashboard and CLI
5. **Regular Audits**: Regularly review access logs and usage patterns

### For Developers

1. **Dependency Updates**: Keep all dependencies updated
2. **Code Review**: All code changes require review
3. **Testing**: Include security tests in the test suite
4. **Static Analysis**: Use ESLint and TypeScript for code quality
5. **Environment Isolation**: Use separate environments for development and production

## Security Features

### Data Protection
- **Local-First**: Sensitive data stays on your machine by default
- **Optional Cloud Sync**: Choose what data to sync to Supabase
- **Encryption**: All data in transit is encrypted with TLS
- **Access Control**: Supabase RLS (Row Level Security) protects user data

### Authentication
- **Supabase Auth**: Industry-standard authentication
- **Multi-Factor Authentication**: Support for 2FA
- **Session Management**: Secure session handling
- **API Key Protection**: Secure storage and transmission

### Infrastructure
- **Supabase Security**: Leverages PostgreSQL and secure cloud infrastructure
- **HTTPS Only**: All communications use HTTPS
- **Security Headers**: Proper security headers in responses
- **Input Validation**: All inputs are validated and sanitized

## Known Security Considerations

### API Key Handling
- API keys are stored in environment variables
- Keys are never logged or transmitted in plain text
- CLI tool uses secure storage mechanisms where available

### Local Data Storage
- Interaction logs are stored locally in plain text
- Users should secure their local environment
- Consider encrypting sensitive local data

### Network Communications
- All API communications use HTTPS
- Local proxy server runs on localhost only
- Supabase communications are encrypted

## Vulnerability Disclosure

When a security vulnerability is fixed:

1. **Security Advisory**: We'll publish a security advisory on GitHub
2. **Release Notes**: Security fixes will be clearly marked in release notes
3. **User Notification**: Critical vulnerabilities will trigger user notifications
4. **Credit**: We'll credit the reporter (unless they prefer to remain anonymous)

## Security Resources

- **OWASP Top 10**: We follow OWASP security guidelines
- **Supabase Security**: [Supabase Security Documentation](https://supabase.com/docs/guides/security)
- **Next.js Security**: [Next.js Security Guidelines](https://nextjs.org/docs/advanced-features/security-headers)
- **Node.js Security**: [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Contact

For security-related questions or concerns:

- **Email**: security@toknxr.com
- **PGP Key**: Available upon request
- **Response Time**: Within 24 hours for security inquiries

## Acknowledgments

We appreciate the security research community and welcome responsible disclosure of vulnerabilities. Contributors who report valid security issues will be acknowledged in our security advisories (unless they prefer to remain anonymous).

---

Thank you for helping keep TokNxr and our users safe!