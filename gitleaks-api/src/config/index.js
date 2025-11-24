const PORT = process.env.PORT || 5002;
const GITLEAKS_CONFIG_PATH = process.env.GITLEAKS_CONFIG_PATH || '';
const GITLEAKS_BIN = process.env.GITLEAKS_BIN || 'gitleaks';

module.exports = {
  PORT,
  GITLEAKS_CONFIG_PATH,
  GITLEAKS_BIN,
};
