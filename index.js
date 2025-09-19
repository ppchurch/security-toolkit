const { installSecurityToolkit, detectProjectType } = require('./scripts/install');

module.exports = {
  install: installSecurityToolkit,
  detectProjectType,
  version: require('./package.json').version
};