import { loadEnv } from '../services/envLoader.js';
import { validateEnvService } from '../services/validateEnvService.js';
import { fetchGitHubSecrets, compareSecrets } from '../services/githubSync.js';
import chalk from 'chalk';

export const validateEnv = async ({ token, repo, schemaPath, requiredVarsArray }) => {
  try {
    console.log(chalk.blue('🔍 Loading environment variables...'));
    const envVars = await loadEnv('.env', requiredVarsArray, schemaPath);

    if (schemaPath) {
      console.log(chalk.green('✔️  Schema validation enabled. Checking against schema.json...'));
      validateEnvService(envVars, schemaPath);
      console.log(chalk.green('✔️  Environment variables are valid according to the schema.'));
    } else {
      console.log(chalk.yellow('⚠️  Schema validation skipped (schemaPath not provided).'));
    }

    console.log(chalk.blue('🔍 Fetching GitHub secrets...'));
    const githubSecrets = await fetchGitHubSecrets(token, repo);
    const missingSecrets = compareSecrets(requiredVarsArray, githubSecrets);

    if (missingSecrets.length > 0) {
      console.log(chalk.red.bold('❌ Missing Secrets in GitHub:'));
      missingSecrets.forEach((secret) => {
        console.log(chalk.red(`- ${secret}`));
      });
    } else {
      console.log(chalk.green('✔️  All GitHub secrets are correctly set.'));
    }

    console.log(chalk.green('✔️  Validation completed successfully.'));
  } catch (error) {
    console.error(chalk.red(`❌ Validation failed: ${error.message}`));
    process.exit(1);
  }
};