const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

const DEPENDENCIES = {
  basic: {
    devDependencies: {
      'husky': '^8.0.3',
      'lint-staged': '^15.2.0',
      'prettier': '^3.1.1'
    }
  },
  standard: {
    devDependencies: {
      'husky': '^8.0.3',
      'lint-staged': '^15.2.0',
      'prettier': '^3.1.1',
      'snyk': '^1.1299.0'
    }
  },
  enterprise: {
    devDependencies: {
      'husky': '^8.0.3',
      'lint-staged': '^15.2.0',
      'prettier': '^3.1.1',
      'snyk': '^1.1299.0',
      'eslint': '^8.47.0'
    }
  }
};

const SCRIPTS = {
  basic: {
    'lint': 'prettier --check .',
    'lint:fix': 'prettier --write .',
    'security:audit': 'npm audit --audit-level=moderate',
    'prepare': 'husky install',
    'pre-commit': 'lint-staged'
  },
  standard: {
    'lint': 'prettier --check .',
    'lint:fix': 'prettier --write .',
    'security:audit': 'npm audit --audit-level=moderate',
    'security:snyk': 'snyk test --severity-threshold=medium',
    'security:full': 'npm run security:audit && npm run security:snyk',
    'prepare': 'husky install',
    'pre-commit': 'lint-staged'
  },
  enterprise: {
    'lint': 'eslint . && prettier --check .',
    'lint:fix': 'eslint . --fix && prettier --write .',
    'security:audit': 'npm audit --audit-level=moderate',
    'security:snyk': 'snyk test --severity-threshold=medium',
    'security:snyk-code': 'snyk code test --severity-threshold=medium',
    'security:snyk-iac': 'snyk iac test --severity-threshold=medium --exclude=node_modules',
    'security:full': 'npm run security:audit && npm run security:snyk',
    'prepare': 'husky install',
    'pre-commit': 'lint-staged'
  }
};

async function detectProjectType(targetDir) {
  const packageJson = await fs.readJson(path.join(targetDir, 'package.json'));

  const isMonorepo = packageJson.workspaces && packageJson.workspaces.length > 0;
  const isTypeScript = packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript;
  const isReact = packageJson.dependencies?.react || packageJson.devDependencies?.react;
  const isNextJs = packageJson.dependencies?.next || packageJson.devDependencies?.next;
  const isExpress = packageJson.dependencies?.express;
  const isNestJs = packageJson.dependencies?.['@nestjs/core'];

  return {
    isMonorepo,
    isTypeScript,
    isReact,
    isNextJs,
    isExpress,
    isNestJs,
    framework: isNextJs ? 'nextjs' : isNestJs ? 'nestjs' : isReact ? 'react' : isExpress ? 'express' : 'node'
  };
}

async function updatePackageJson(targetDir, preset, projectType) {
  console.log(chalk.blue('📦 Updating package.json...'));

  const packageJsonPath = path.join(targetDir, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  // Add dependencies
  if (!packageJson.devDependencies) packageJson.devDependencies = {};
  Object.assign(packageJson.devDependencies, DEPENDENCIES[preset].devDependencies);

  // Add scripts
  if (!packageJson.scripts) packageJson.scripts = {};
  Object.assign(packageJson.scripts, SCRIPTS[preset]);

  // Add lint-staged configuration
  packageJson['lint-staged'] = {
    '**/*.{js,jsx,ts,tsx}': [
      'prettier --write',
      ...(preset === 'enterprise' ? ['eslint --fix'] : [])
    ],
    '**/*.{json,md,yml,yaml}': [
      'prettier --write'
    ]
  };

  // Add husky configuration (legacy format for compatibility)
  if (!packageJson.husky) {
    packageJson.husky = {
      hooks: {
        'pre-commit': 'lint-staged',
        'pre-push': preset === 'basic'
          ? 'npm run security:audit'
          : 'npm run security:full'
      }
    };
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  console.log(chalk.green('✅ package.json updated'));
}

async function copyConfigFiles(targetDir, preset, projectType) {
  console.log(chalk.blue('📋 Setting up configuration files...'));

  const templatesDir = path.join(__dirname, '..', 'templates');

  // Copy prettier config
  await fs.copy(
    path.join(templatesDir, 'prettierrc'),
    path.join(targetDir, '.prettierrc')
  );

  // Copy prettier ignore
  await fs.copy(
    path.join(templatesDir, 'prettierignore'),
    path.join(targetDir, '.prettierignore')
  );

  // Copy lint-staged config
  await fs.copy(
    path.join(templatesDir, 'lintstagedrc.json'),
    path.join(targetDir, '.lintstagedrc.json')
  );

  // Copy ESLint config for enterprise preset
  if (preset === 'enterprise') {
    const eslintConfigFile = projectType.isTypeScript ? 'eslintrc.typescript.js' : 'eslintrc.js';
    await fs.copy(
      path.join(templatesDir, eslintConfigFile),
      path.join(targetDir, '.eslintrc.js')
    );
  }

  console.log(chalk.green('✅ Configuration files created'));
}

async function setupGitHooks(targetDir, preset, options) {
  if (options.noHooks) {
    console.log(chalk.yellow('⏭️  Skipping git hooks setup'));
    return;
  }

  console.log(chalk.blue('🪝 Setting up git hooks...'));

  const hooksDir = path.join(targetDir, '.git', 'hooks');

  if (!await fs.pathExists(hooksDir)) {
    console.log(chalk.yellow('⚠️  .git/hooks directory not found. Make sure this is a git repository.'));
    return;
  }

  // Create husky directory structure
  await fs.ensureDir(path.join(hooksDir, '_'));

  // Copy hook templates
  const hookTemplatesDir = path.join(__dirname, '..', 'hooks');

  // Copy pre-commit hook
  const preCommitTemplate = await fs.readFile(
    path.join(hookTemplatesDir, 'pre-commit.template'),
    'utf8'
  );
  const preCommitHook = preCommitTemplate.replace('{{PRESET}}', preset);

  await fs.writeFile(
    path.join(hooksDir, 'pre-commit'),
    preCommitHook,
    { mode: 0o755 }
  );

  // Copy pre-push hook
  const prePushTemplate = await fs.readFile(
    path.join(hookTemplatesDir, 'pre-push.template'),
    'utf8'
  );
  const prePushHook = prePushTemplate.replace('{{PRESET}}', preset);

  await fs.writeFile(
    path.join(hooksDir, 'pre-push'),
    prePushHook,
    { mode: 0o755 }
  );

  // Copy husky.sh
  await fs.copy(
    path.join(hookTemplatesDir, 'husky.sh'),
    path.join(hooksDir, '_', 'husky.sh')
  );

  console.log(chalk.green('✅ Git hooks installed'));
}

async function installSecurityToolkit(targetDir, options) {
  const preset = options.preset || 'standard';

  console.log(chalk.blue(`🔧 Installing ${preset} security preset...`));

  // Detect project type
  const projectType = await detectProjectType(targetDir);
  console.log(chalk.gray(`📊 Detected: ${projectType.framework}${projectType.isTypeScript ? ' + TypeScript' : ''}${projectType.isMonorepo ? ' (monorepo)' : ''}`));

  // Update package.json
  await updatePackageJson(targetDir, preset, projectType);

  // Copy configuration files
  await copyConfigFiles(targetDir, preset, projectType);

  // Setup git hooks
  await setupGitHooks(targetDir, preset, options);

  // Show Snyk setup instructions
  if (preset !== 'basic' && !options.noSnyk) {
    console.log(chalk.yellow('\n🔐 Snyk Setup Required:'));
    console.log('1. Create account at https://snyk.io');
    console.log('2. Run: snyk auth');
    console.log('3. Your toolkit will use Snyk automatically');
  }

  return {
    preset,
    projectType,
    installed: true
  };
}

module.exports = {
  installSecurityToolkit,
  detectProjectType
};