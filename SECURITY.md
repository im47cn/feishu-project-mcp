# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| 0.1.x   | :x:                |

## Reporting a Vulnerability

We take the security of Feishu Project MCP Service seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do the following:

- **Do not** report security vulnerabilities through public GitHub issues.
- Report security vulnerabilities by emailing our security team at [security@your-domain.com](mailto:security@your-domain.com).
- Include as much information as possible in your report:
  - Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
  - Full paths of source file(s) related to the manifestation of the issue
  - The location of the affected source code (tag/branch/commit or direct URL)
  - Any special configuration required to reproduce the issue
  - Step-by-step instructions to reproduce the issue
  - Proof-of-concept or exploit code (if possible)
  - Impact of the issue, including how an attacker might exploit it

### What to expect:

- We will acknowledge your email within 48 hours.
- We will send a more detailed response within 72 hours indicating the next steps in handling your report.
- We will keep you informed of the progress towards a fix and full announcement.
- We may ask for additional information or guidance.

### Security Update Process:

1. Security report received and is assigned a primary handler.
2. Problem is confirmed and a list of all affected versions is determined.
3. Code is audited to find any potential similar problems.
4. Fixes are prepared for all supported releases.
5. Fixes are released and announced publicly.

## Security Best Practices

When deploying Feishu Project MCP Service, please follow these security best practices:

1. **Environment Configuration**

   - Use environment variables for sensitive configuration
   - Never commit .env files to version control
   - Use secure secrets management in production

2. **API Security**

   - Always use HTTPS in production
   - Implement rate limiting
   - Use appropriate authentication methods
   - Validate all input data

3. **Docker Security**

   - Keep base images updated
   - Run containers as non-root user
   - Use multi-stage builds
   - Scan images for vulnerabilities

4. **Dependencies**

   - Regularly update dependencies
   - Use dependency scanning tools
   - Monitor security advisories

5. **Access Control**
   - Implement proper authentication
   - Use principle of least privilege
   - Regularly audit access logs

## Security Features

The Feishu Project MCP Service includes several security features:

1. **Input Validation**

   - All API inputs are validated
   - SQL injection prevention
   - XSS protection

2. **Authentication & Authorization**

   - Token-based authentication
   - Role-based access control
   - Session management

3. **Logging & Monitoring**

   - Security event logging
   - Audit trails
   - Error logging without sensitive data

4. **Data Protection**
   - Encryption at rest
   - Secure communication
   - Data sanitization

## Vulnerability Disclosure Timeline

- **0-48 hours**: Initial response and confirmation
- **48-72 hours**: Preliminary analysis
- **72+ hours**: Investigation and patch development
- **7-14 days**: Patch testing and deployment
- **14-21 days**: Public disclosure (if appropriate)

## Bug Bounty Program

Currently, we do not operate a bug bounty program. However, we deeply appreciate the work of security researchers and will acknowledge your contribution in our security advisory if you wish.

## Security Contacts

- Primary Security Contact: [security@your-domain.com](mailto:security@your-domain.com)
- Backup Security Contact: [security-backup@your-domain.com](mailto:security-backup@your-domain.com)
- For non-security issues, please use [GitHub Issues](https://github.com/your-username/feishu-project-mcp/issues)
