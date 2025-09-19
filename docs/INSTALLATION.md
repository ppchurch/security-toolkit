# 📦 Installation Guide

## Prerequisites

- Node.js 14+
- npm or yarn
- Git repository initialized
- package.json file in your project

## Quick Installation

### Option 1: NPX (Recommended)
```bash
npx @ppc/security-toolkit install
```

### Option 2: Global Installation
```bash
npm install -g @ppc/security-toolkit
security-toolkit install
```

### Option 3: Clone and Install
```bash
git clone https://github.com/ppchurch/security-toolkit.git
cd security-toolkit
npm run install-to /path/to/your/project
```

## Installation Options

### Security Presets

#### Basic Preset (Free)
```bash
security-toolkit install --preset basic
```
- ✅ Prettier code formatting
- ✅ npm audit security scanning
- ✅ Git hooks (pre-commit formatting)
- ✅ No external dependencies

#### Standard Preset (Recommended)
```bash
security-toolkit install --preset standard
```
- ✅ Everything from Basic
- ✅ Snyk vulnerability scanning
- ✅ Enhanced git hooks
- ✅ Requires Snyk account (free tier available)

#### Enterprise Preset (Full Security)
```bash
security-toolkit install --preset enterprise
```
- ✅ Everything from Standard
- ✅ ESLint code quality rules
- ✅ Snyk code analysis (requires paid plan)
- ✅ Infrastructure as Code scanning
- ✅ Comprehensive pre-push validation

### Additional Options

```bash
# Force installation (overwrite existing files)
security-toolkit install --force

# Skip Snyk integration
security-toolkit install --no-snyk

# Skip git hooks setup
security-toolkit install --no-hooks

# Interactive preset selection
security-toolkit preset
```

## Post-Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Authenticate with Snyk (Standard/Enterprise only)
```bash
# Create free account at https://snyk.io
snyk auth
```

### 3. Test the Setup
```bash
# Test security scanning
npm run security:audit

# Test code formatting
npm run lint

# Make a test commit to verify hooks
git add .
git commit -m "Test security toolkit"
```

## Project Type Detection

The toolkit automatically detects your project type and adjusts configuration:

| Project Type | Auto-detected Features |
|--------------|----------------------|
| **TypeScript** | TypeScript-specific ESLint rules |
| **React** | React-specific linting and formatting |
| **Next.js** | Next.js optimized configuration |
| **Express** | Node.js server-specific rules |
| **NestJS** | NestJS framework configuration |
| **Monorepo** | Workspace-aware configurations |

## Troubleshooting Installation

### Common Issues

#### "No package.json found"
```bash
# Initialize npm project first
npm init -y
security-toolkit install
```

#### "Git hooks not working"
```bash
# Ensure you're in a git repository
git init
security-toolkit install
```

#### "Permission denied" errors
```bash
# On Unix systems, ensure proper permissions
chmod +x node_modules/.bin/security-toolkit
```

#### "Snyk command not found"
```bash
# Install Snyk globally
npm install -g snyk
snyk auth
```

### Getting Help

- 📚 [Configuration Guide](./CONFIGURATION.md)
- 🔧 [Troubleshooting](./TROUBLESHOOTING.md)
- 🐛 [Report Issues](https://github.com/ppchurch/security-toolkit/issues)
- 💬 [Discussions](https://github.com/ppchurch/security-toolkit/discussions)

## Manual Cleanup

To remove the security toolkit:

```bash
# Remove dependencies
npm uninstall husky lint-staged prettier snyk

# Remove configuration files
rm .prettierrc .prettierignore .lintstagedrc.json .eslintrc.js

# Remove git hooks
rm .git/hooks/pre-commit .git/hooks/pre-push

# Clean package.json (remove added scripts manually)
```