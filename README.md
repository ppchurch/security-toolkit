# 🛡️ Enterprise Security Toolkit

A comprehensive, reusable security pipeline for Node.js projects with automated vulnerability scanning, code quality enforcement, and git hooks.

## 🚀 Features

### 🔍 **Multi-Layer Security Scanning**
- **Snyk Integration**: Advanced dependency vulnerability detection
- **npm audit**: Built-in dependency security scanning
- **Static Code Analysis**: Code quality and security issues detection
- **Infrastructure as Code**: Docker and Terraform security scanning

### 📝 **Code Quality Enforcement**
- **Prettier**: Automatic code formatting
- **ESLint**: Code quality and consistency rules
- **Lint-staged**: Run checks only on changed files for speed
- **TypeScript**: Full TypeScript support and checking

### 🎯 **Git Hooks Automation**
- **Pre-commit**: Format, lint, and security scan before commits
- **Pre-push**: Comprehensive testing and security validation
- **Customizable**: Configurable security thresholds and rules

### ⚡ **Developer Experience**
- **Fast execution**: Optimized for developer productivity
- **Easy installation**: One-command setup
- **Multiple project types**: Support for monorepos, single repos, and different frameworks
- **Graceful degradation**: Works with free and paid security tools

## 📦 Quick Start

### Installation

```bash
# Install the security toolkit in your project
npx @yourorg/security-toolkit install

# Or for manual installation
git clone https://github.com/yourorg/security-toolkit.git
cd security-toolkit
npm run install-to /path/to/your/project
```

### Supported Project Types
- ✅ **Node.js** applications
- ✅ **TypeScript** projects
- ✅ **React/Next.js** frontend applications
- ✅ **Express/NestJS** backend services
- ✅ **Monorepo** structures
- ✅ **Docker** containerized applications

## 🔧 Configuration

The toolkit provides multiple configuration presets:

- `basic` - Essential security scanning (free tools only)
- `standard` - Recommended setup with Snyk integration
- `enterprise` - Full security suite with all features
- `custom` - Build your own configuration

## 📋 Available Security Commands

Once installed, your project will have these new npm scripts:

```bash
# Security scanning
npm run security:audit       # npm vulnerability check
npm run security:snyk        # Snyk dependency scan
npm run security:snyk-code   # Static code analysis
npm run security:snyk-iac    # Infrastructure scanning
npm run security:full        # Complete security suite

# Code quality
npm run lint                 # Run all linters
npm run lint:fix            # Auto-fix linting issues
npm run format              # Format code with Prettier

# Git hooks (automatic)
# Pre-commit: formatting + linting + security audit
# Pre-push: tests + full security scan + build verification
```

## 🛠️ Manual Setup

If you prefer manual installation, see [MANUAL_SETUP.md](./docs/MANUAL_SETUP.md)

## 📊 Security Thresholds

Default security settings:
- **npm audit**: Moderate+ severity issues block commits
- **Snyk**: Medium+ severity issues block commits
- **Code quality**: ESLint errors block commits
- **Tests**: Failed tests block pushes

All thresholds are customizable via configuration files.

## 🔐 Authentication

### Snyk Setup
1. Create free account at [snyk.io](https://snyk.io)
2. Run `snyk auth` in your terminal
3. The toolkit will automatically use your authentication

### CI/CD Integration
See [CI_CD_SETUP.md](./docs/CI_CD_SETUP.md) for GitHub Actions, GitLab CI, and other platforms.

## 📚 Documentation

- [Installation Guide](./docs/INSTALLATION.md)
- [Configuration Options](./docs/CONFIGURATION.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Contributing](./docs/CONTRIBUTING.md)

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./docs/CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Built with ❤️ for secure, high-quality code**