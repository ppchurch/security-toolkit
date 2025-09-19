# ⚙️ Configuration Guide

## Security Presets Overview

| Preset | Tools Included | Use Case | Snyk Required |
|--------|---------------|----------|---------------|
| **Basic** | Prettier, npm audit, git hooks | Small projects, quick setup | No |
| **Standard** | Basic + Snyk dependency scanning | Most projects | Yes (free) |
| **Enterprise** | Standard + ESLint + Snyk Code/IaC | Large teams, strict security | Yes (paid) |

## Customizing Security Thresholds

### npm Audit Levels
```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=high"
  }
}
```

Options: `low`, `moderate`, `high`, `critical`

### Snyk Severity Thresholds
```json
{
  "scripts": {
    "security:snyk": "snyk test --severity-threshold=high"
  }
}
```

Options: `low`, `medium`, `high`, `critical`

## Code Quality Configuration

### Prettier Customization
Edit `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 4
}
```

### ESLint Rules (Enterprise)
Edit `.eslintrc.js`:
```javascript
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'error',        // Block console statements
    'no-unused-vars': 'error',    // Block unused variables
    'prefer-const': 'error'       // Enforce const usage
  }
};
```

### Lint-staged Configuration
Edit `.lintstagedrc.json`:
```json
{
  "**/*.{js,jsx,ts,tsx}": [
    "prettier --write",
    "eslint --fix",
    "git add"
  ],
  "**/*.md": [
    "prettier --write"
  ]
}
```

## Git Hooks Customization

### Disable Specific Checks
```bash
# Skip pre-commit hooks temporarily
git commit --no-verify -m "Emergency fix"

# Skip pre-push hooks
git push --no-verify
```

### Custom Hook Scripts
Edit `.git/hooks/pre-commit`:
```bash
#!/usr/bin/env sh

# Add custom checks here
echo "Running custom security checks..."

# Call original security toolkit checks
npx lint-staged
npm run security:audit
```

## Project-Specific Configurations

### Monorepo Setup
For workspaces, add to root `package.json`:
```json
{
  "scripts": {
    "lint:all": "npm run lint --workspaces",
    "security:all": "npm run security:audit --workspaces"
  }
}
```

### TypeScript Projects
The toolkit auto-detects TypeScript and adds appropriate configurations:
- TypeScript-specific ESLint rules
- TS file extensions in lint-staged
- Type checking in pre-commit hooks

### Framework-Specific Settings

#### React/Next.js
```json
{
  "lint-staged": {
    "**/*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "**/*.{css,scss}": [
      "prettier --write"
    ]
  }
}
```

#### Node.js/Express
```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "test:security": "npm run security:audit && npm run security:snyk"
  }
}
```

## Environment-Specific Configuration

### Development vs Production
```bash
# Development - more lenient
export SECURITY_LEVEL="moderate"

# Production - strict
export SECURITY_LEVEL="high"
```

### CI/CD Integration

#### GitHub Actions
```yaml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Run security scan
        run: npm run security:full
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Excluding Files

#### Prettier Ignore
Edit `.prettierignore`:
```
node_modules/
dist/
build/
*.min.js
legacy-code/
```

#### ESLint Ignore
Create `.eslintignore`:
```
node_modules/
dist/
build/
*.config.js
legacy/
```

#### Snyk Ignore
Create `.snyk`:
```yaml
ignore:
  SNYK-JS-LODASH-567746:
    - lodash:
        reason: False positive in dev dependency
        expires: '2024-12-31T23:59:59.999Z'
```

## Advanced Configuration

### Custom Security Scripts
```json
{
  "scripts": {
    "security:deps": "npm audit && snyk test",
    "security:code": "snyk code test",
    "security:docker": "snyk container test",
    "security:iac": "snyk iac test",
    "security:monitor": "snyk monitor"
  }
}
```

### Conditional Security Checks
```bash
# Only run Snyk if token is available
if [ -n "$SNYK_TOKEN" ]; then
  npm run security:snyk
fi
```

## Troubleshooting Configuration

### Common Issues

1. **"Prettier conflicts with ESLint"**
   - Use `eslint-config-prettier` to disable conflicting rules

2. **"Git hooks not running"**
   - Check `.git/hooks/` permissions: `chmod +x .git/hooks/*`

3. **"Snyk authentication failed"**
   - Run `snyk auth` to re-authenticate

4. **"Lint-staged not finding files"**
   - Check glob patterns in `.lintstagedrc.json`

For more troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)