# 🔧 Troubleshooting Guide

## Common Installation Issues

### "No package.json found"
**Problem**: Toolkit requires a Node.js project with package.json

**Solution**:
```bash
npm init -y
security-toolkit install
```

### "Permission denied" on git hooks
**Problem**: Git hooks don't have execute permissions

**Solution**:
```bash
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
```

### "Snyk command not found"
**Problem**: Snyk CLI not installed or not in PATH

**Solution**:
```bash
npm install -g snyk
snyk auth
```

## Git Hooks Issues

### Hooks not running
1. Check if you're in a git repository: `git status`
2. Verify hook files exist: `ls -la .git/hooks/`
3. Check permissions: `chmod +x .git/hooks/*`
4. Test manually: `.git/hooks/pre-commit`

### "husky command not found"
**Solution**:
```bash
npm install husky --save-dev
npx husky install
```

### Hooks run but fail silently
Enable debug mode:
```bash
export HUSKY_DEBUG=1
git commit -m "test"
```

## Security Scanning Issues

### npm audit fails
```bash
# Update npm to latest version
npm install -g npm@latest

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Snyk authentication issues
```bash
# Re-authenticate
snyk auth

# Check token
snyk config get api

# Manual token setting
snyk config set api=YOUR_TOKEN
```

### False positives in security scans
Create `.snyk` file to ignore specific vulnerabilities:
```yaml
ignore:
  SNYK-JS-EXAMPLE-123456:
    - example-package:
        reason: False positive - dev dependency only
        expires: '2024-12-31T23:59:59.999Z'
```

## Code Quality Issues

### Prettier conflicts with ESLint
Install compatibility package:
```bash
npm install --save-dev eslint-config-prettier
```

Add to `.eslintrc.js`:
```javascript
module.exports = {
  extends: ['eslint:recommended', 'prettier']
};
```

### Lint-staged not finding files
Check your `.lintstagedrc.json` patterns:
```json
{
  "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"],
  "*.{json,md}": ["prettier --write"]
}
```

### Performance issues with large repositories
Optimize lint-staged:
```json
{
  "*.{js,jsx,ts,tsx}": [
    "prettier --write",
    "eslint --fix --max-warnings=0"
  ]
}
```

## CI/CD Integration Issues

### GitHub Actions failing
Ensure Snyk token is set:
```yaml
env:
  SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

Add token in GitHub repository settings > Secrets

### Memory issues in CI
Increase Node.js memory:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

## Project-Specific Issues

### Monorepo workspaces
Update scripts for workspace support:
```json
{
  "scripts": {
    "lint:all": "npm run lint --workspaces --if-present",
    "security:all": "npm run security:audit --workspaces --if-present"
  }
}
```

### TypeScript compilation errors
Ensure TypeScript is properly configured:
```bash
npm install --save-dev typescript @types/node
npx tsc --init
```

### Docker integration issues
For containerized projects, ensure Snyk can scan containers:
```bash
# Install Docker plugin
snyk auth
docker build -t myapp .
snyk container test myapp
```

## Performance Optimization

### Slow pre-commit hooks
1. Use `lint-staged` instead of running on all files
2. Exclude large directories in `.prettierignore`
3. Use `--max-warnings=0` for ESLint

### Large dependency trees
```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
# or
npm install -g source-map-explorer
```

## Getting Help

### Enable verbose logging
```bash
export DEBUG="security-toolkit:*"
security-toolkit install --preset standard
```

### Generate debug report
```bash
# System information
node --version
npm --version
git --version

# Project information
cat package.json | jq '.dependencies, .devDependencies'
ls -la .git/hooks/

# Security toolkit version
security-toolkit --version
```

### Common Environment Variables
```bash
# Skip hooks temporarily
export HUSKY=0

# Debug mode
export HUSKY_DEBUG=1

# Skip Snyk temporarily
export SNYK_DISABLE=1

# Custom security thresholds
export SECURITY_LEVEL=high
```

### Still Need Help?

1. 🐛 [Report bugs](https://github.com/ppchurch/security-toolkit/issues)
2. 💬 [Ask questions](https://github.com/ppchurch/security-toolkit/discussions)
3. 📧 [Email support](mailto:support@example.com)
4. 📚 [Read documentation](../README.md)

Include this information when reporting issues:
- Operating system and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Security toolkit version
- Project type (React, Node.js, etc.)
- Error messages and logs