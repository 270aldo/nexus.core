# Security Guidelines for NEXUS-CORE

## 🔐 Critical Security Alert

**IMMEDIATE ACTION REQUIRED**: If you have previously committed `.env` files with real credentials to version control, you must:

1. **Rotate all exposed credentials immediately**
2. **Remove sensitive files from git history** (see instructions below)
3. **Update all services with new credentials**

## 🛡️ Security Best Practices

### 1. Environment Variables

**NEVER commit these files to version control:**
- `.env`
- `.env.local`
- `.env.production`
- Any file containing real credentials

**ALWAYS use:**
- `.env.example` files with dummy values for documentation
- Environment-specific configurations in your deployment platform
- Secrets management services for production

### 2. Credential Management

#### Development Environment
```bash
# Use the setup script to configure your local environment
python scripts/setup-env.py
```

#### Production Environment
Use one of these approaches:
- **Cloud Secrets Manager** (AWS Secrets Manager, Google Secret Manager, Azure Key Vault)
- **Environment Variables** set in your hosting platform
- **Kubernetes Secrets** if using K8s
- **HashiCorp Vault** for enterprise deployments

### 3. Required Credentials

#### Backend Services
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Service role key (full access - keep secure!)
- `SUPABASE_ANON_KEY`: Anonymous key (safe for frontend)
- `FIREBASE_PROJECT_ID`: Firebase project identifier
- `FIREBASE_PRIVATE_KEY`: Service account private key
- `JWT_SECRET_KEY`: Secret for signing JWTs (generate with `openssl rand -base64 32`)

#### Frontend Services
- `VITE_SUPABASE_URL`: Same as backend
- `VITE_SUPABASE_ANON_KEY`: Same as backend (this is safe for frontend)
- Firebase config (if using Firebase Auth in frontend)

### 4. Security Checklist

Before each commit:
- [ ] No `.env` files are being committed
- [ ] No hardcoded credentials in source code
- [ ] No sensitive data in comments
- [ ] No production URLs with embedded credentials
- [ ] No API keys in frontend code (except public keys)

### 5. Removing Sensitive Data from Git History

If you've accidentally committed sensitive data:

```bash
# Install BFG Repo-Cleaner
brew install bfg  # On macOS

# Clone a fresh copy of your repo
git clone --mirror git@github.com:yourrepo/nexus_core.git

# Remove files containing sensitive data
bfg --delete-files .env nexus_core.git

# Remove sensitive strings
bfg --replace-text passwords.txt nexus_core.git

# Clean up
cd nexus_core.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Push the cleaned history
git push --force
```

**Note**: This rewrites history. Coordinate with your team before doing this.

### 6. Security Headers

Ensure your production deployment includes these headers:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### 7. API Security

- **Rate Limiting**: Implement rate limiting on all endpoints
- **Authentication**: Verify JWT tokens on every request
- **Authorization**: Check user permissions for each action
- **Input Validation**: Sanitize all user inputs
- **SQL Injection**: Use parameterized queries (Supabase handles this)

### 8. Monitoring & Alerts

Set up monitoring for:
- Failed authentication attempts
- Unusual API usage patterns
- Database query anomalies
- Error rates and response times

### 9. Incident Response

If a security breach occurs:
1. **Immediately rotate all credentials**
2. **Notify affected users if applicable**
3. **Review logs to understand the breach**
4. **Patch the vulnerability**
5. **Document lessons learned**

### 10. Regular Security Tasks

**Weekly:**
- Review access logs
- Check for dependency vulnerabilities (`npm audit`, `pip-audit`)

**Monthly:**
- Rotate development credentials
- Review user permissions
- Update dependencies

**Quarterly:**
- Security audit
- Penetration testing (for production)
- Review and update security policies

## 🚨 Security Contacts

- **Security Lead**: [Name] - [Email]
- **Emergency Contact**: [Phone/Email]
- **Report Security Issues**: security@ngxperformance.com

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/managing-user-data)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

**Remember**: Security is everyone's responsibility. When in doubt, ask for help!