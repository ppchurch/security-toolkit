#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs-extra');
const { installSecurityToolkit } = require('../scripts/install');

const program = new Command();

program
  .name('security-toolkit')
  .description('Enterprise security pipeline for Node.js projects')
  .version(require('../package.json').version);

program
  .command('install')
  .description('Install security toolkit in current project')
  .option('-p, --preset <preset>', 'Security preset: basic, standard, enterprise, custom', 'standard')
  .option('-f, --force', 'Force installation even if files exist')
  .option('--no-snyk', 'Skip Snyk integration')
  .option('--no-hooks', 'Skip git hooks setup')
  .action(async (options) => {
    try {
      console.log(chalk.blue.bold('🛡️  Enterprise Security Toolkit'));
      console.log(chalk.gray('Installing security pipeline...\n'));

      const targetDir = process.cwd();

      // Check if this is a valid Node.js project
      const packageJsonPath = path.join(targetDir, 'package.json');
      if (!await fs.pathExists(packageJsonPath)) {
        console.error(chalk.red('❌ No package.json found. Please run this in a Node.js project directory.'));
        process.exit(1);
      }

      await installSecurityToolkit(targetDir, options);

      console.log(chalk.green.bold('\n✅ Security toolkit installed successfully!'));
      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log('1. Run: npm install');
      console.log('2. Run: npm run security:audit (test the setup)');
      console.log('3. Make a commit to test the pre-commit hooks');

    } catch (error) {
      console.error(chalk.red('❌ Installation failed:'), error.message);
      process.exit(1);
    }
  });

program
  .command('update')
  .description('Update security toolkit configuration')
  .action(async () => {
    console.log(chalk.blue('🔄 Updating security toolkit...'));
    // TODO: Implement update functionality
  });

program
  .command('check')
  .description('Check current security configuration')
  .action(async () => {
    console.log(chalk.blue('🔍 Checking security configuration...'));
    // TODO: Implement check functionality
  });

program
  .command('preset')
  .description('Choose a different security preset')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Choose a security preset:',
        choices: [
          { name: 'Basic - Essential security (free tools)', value: 'basic' },
          { name: 'Standard - Recommended setup', value: 'standard' },
          { name: 'Enterprise - Full security suite', value: 'enterprise' },
          { name: 'Custom - Build your own', value: 'custom' }
        ]
      }
    ]);

    console.log(chalk.blue(`Installing ${answers.preset} preset...`));
    // TODO: Implement preset switching
  });

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}