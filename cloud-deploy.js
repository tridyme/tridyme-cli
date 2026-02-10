/**
 * Cloud deployment module for tridyme-cli.
 * Packages the project, uploads to the Deploy API,
 * and polls for deployment status until completion.
 */
const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');
const inquirer = require('inquirer');
const FormData = require('form-data');

const { createAuthClient, loadCredentials } = require('./auth');
const { validateProject } = require('./deploy');

// Files/dirs to exclude from the source archive
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'env/**',
  'venv/**',
  '.venv/**',
  '__pycache__/**',
  '.pytest_cache/**',
  '.coverage',
  '*.pyc',
  '.env',
  '.env.development',
  '.env.production',
  'frontend/build/**',
  'backend/env/**',
  '.DS_Store',
  'coverage.xml',
  'junit.xml',
  '*.tar.gz',
  'logs/**',
  'tmp/**',
];

/**
 * Package the project into a tar.gz buffer.
 */
async function packageProject(projectPath) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    const archive = archiver('tar', { gzip: true, gzipOptions: { level: 6 } });

    archive.on('data', (chunk) => buffers.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(buffers)));
    archive.on('error', reject);

    archive.glob('**/*', {
      cwd: projectPath,
      ignore: EXCLUDE_PATTERNS,
      dot: false,
    });

    archive.finalize();
  });
}

/**
 * Poll deployment status until a terminal state is reached.
 */
async function pollDeploymentStatus(client, deploymentId) {
  const spinner = ora('En attente du deploiement...').start();
  const startTime = Date.now();
  let logsUrlShown = false;
  let lastLogCount = 0;

  while (true) {
    try {
      const response = await client.get(
        `/api/deploy/status/${deploymentId}`
      );
      const deployment = response.data;
      const status = deployment.status;

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const elapsedStr = elapsed >= 60
        ? `${Math.floor(elapsed / 60)}m${(elapsed % 60).toString().padStart(2, '0')}s`
        : `${elapsed}s`;

      // Fetch new logs and display them
      try {
        const logsResponse = await client.get(
          `/api/deploy/logs/${deploymentId}`
        );
        const logs = logsResponse.data;
        if (logs && logs.length > lastLogCount) {
          const newLogs = logs.slice(lastLogCount);
          for (const log of newLogs) {
            if (log.level === 'error') {
              // Errors will be shown at the end
              continue;
            }
            spinner.info(chalk.gray(`[${log.step}] ${log.message}`));
            spinner.start();
          }
          lastLogCount = logs.length;
        }
      } catch (_) {
        // Ignore log fetch errors
      }

      if (status === 'building') {
        spinner.text = `Construction de l'image Docker [${elapsedStr}]...`;
        if (deployment.logs_url && !logsUrlShown) {
          spinner.info(chalk.cyan(`Logs Cloud Build: ${deployment.logs_url}`));
          spinner.start(`Construction de l'image Docker [${elapsedStr}]...`);
          logsUrlShown = true;
        }
      } else if (status === 'pending') {
        spinner.text = 'En file d\'attente...';
      } else if (status === 'uploading') {
        spinner.text = `Upload du code source [${elapsedStr}]...`;
      } else if (status === 'deploying') {
        spinner.text = `Deploiement sur Kubernetes [${elapsedStr}]...`;
      } else if (status === 'configuring_dns') {
        spinner.text = `Configuration DNS et SSL [${elapsedStr}]...`;
      } else {
        spinner.text = `Statut: ${status} [${elapsedStr}]`;
      }

      if (status === 'live') {
        spinner.succeed(chalk.green('Deploiement reussi !'));
        return deployment;
      }

      if (status === 'failed') {
        spinner.fail(chalk.red('Deploiement echoue'));
        if (deployment.error_message) {
          console.log(chalk.red(`\nErreur: ${deployment.error_message}`));
        }
        if (deployment.logs_url) {
          console.log(chalk.yellow(`\nLogs Cloud Build: ${deployment.logs_url}`));
        }
        // Fetch deployment logs for more details
        try {
          const logsResponse = await client.get(
            `/api/deploy/logs/${deploymentId}`
          );
          const logs = logsResponse.data;
          if (logs && logs.length > 0) {
            console.log(chalk.gray('\n--- Logs du deploiement ---'));
            logs.forEach((log) => {
              const color = log.level === 'error' ? chalk.red : log.level === 'warning' ? chalk.yellow : chalk.gray;
              console.log(color(`[${log.step}] ${log.message}`));
            });
            console.log(chalk.gray('---'));
          }
        } catch (_) {
          // Ignore log fetch errors
        }
        return deployment;
      }

      if (status === 'cancelled') {
        spinner.warn('Deploiement annule');
        return deployment;
      }
    } catch (error) {
      // Network error - keep polling
      spinner.text = 'Reconnexion...';
    }

    // Poll every 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

/**
 * Main cloud deployment function.
 * Called by `tridyme deploy` (without --git flag).
 */
async function initiateCloudDeploy(options = {}) {
  const projectPath = options.projectPath || process.cwd();

  // Step 1: Validate project structure
  if (!validateProject(projectPath)) {
    return { success: false, error: 'Structure de projet invalide' };
  }

  // Step 2: Check auth
  const creds = loadCredentials();
  if (!creds) {
    console.log(
      chalk.red(
        'Vous devez etre connecte. Lancez: tridyme login'
      )
    );
    return { success: false, error: 'Non connecte' };
  }

  const client = createAuthClient();

  // Step 3: Determine app_id
  let appId = options.appId;
  if (!appId) {
    // Try reading from .env
    const envPath = path.join(projectPath, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(
        /REACT_APP_APPLICATION_ID="?([^"\n\r]+)"?/
      );
      if (match) appId = match[1].trim();
    }
  }

  if (!appId) {
    // List user's apps and let them pick
    try {
      const appsResponse = await client.get('/api/apps', {
        headers: {
          'X-User-Email': creds.email,
          'X-User-Id': creds.user_id,
        },
      });
      const apps = appsResponse.data;
      if (apps.length === 0) {
        console.log(
          chalk.yellow(
            'Aucune application trouvee. Creez-en une sur la plateforme: https://developers.tridyme.io'
          )
        );
        return { success: false, error: 'Aucune application' };
      }

      const { selectedApp } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedApp',
          message: 'Selectionnez l\'application a deployer:',
          choices: apps.map((a) => ({
            name: `${a.name} (${a.client_id})`,
            value: a.id,
          })),
        },
      ]);
      appId = selectedApp;
    } catch (error) {
      const detail = error.response?.data?.detail || error.message;
      console.log(chalk.red(`Impossible de lister les applications: ${detail}`));
      return { success: false, error: detail };
    }
  }

  // Step 4: Package the project
  const spinner = ora('Packaging du projet...').start();
  let archiveBuffer;
  try {
    archiveBuffer = await packageProject(projectPath);
    const sizeMB = (archiveBuffer.length / (1024 * 1024)).toFixed(1);
    spinner.succeed(`Projet package (${sizeMB} MB)`);
  } catch (error) {
    spinner.fail('Echec du packaging');
    console.error(chalk.red(error.message));
    return { success: false, error: error.message };
  }

  // Check size limit
  if (archiveBuffer.length > 100 * 1024 * 1024) {
    console.log(
      chalk.red('Archive trop volumineuse (max 100 MB). Verifiez que node_modules et .git sont exclus.')
    );
    return { success: false, error: 'Archive trop volumineuse' };
  }

  // Step 5: Upload and trigger deployment
  spinner.start('Upload et lancement du deploiement...');
  let deployment;
  try {
    const form = new FormData();
    form.append('source_archive', archiveBuffer, {
      filename: 'source.tar.gz',
      contentType: 'application/gzip',
    });

    const response = await client.post('/api/deploy/trigger', form, {
      headers: {
        ...form.getHeaders(),
        'X-App-Id': appId,
      },
      maxContentLength: 150 * 1024 * 1024,
      maxBodyLength: 150 * 1024 * 1024,
    });
    deployment = response.data;
    spinner.succeed(
      `Deploiement lance (ID: ${deployment.id}, version: ${deployment.version})`
    );
  } catch (error) {
    spinner.fail('Echec du lancement du deploiement');
    const detail = error.response?.data?.detail || error.message;
    console.error(chalk.red(detail));
    return { success: false, error: detail };
  }

  // Step 6: Poll for status
  console.log('');
  const result = await pollDeploymentStatus(client, deployment.id);

  // Step 7: Show final result
  if (result.status === 'live') {
    console.log(
      boxen(
        chalk.green.bold('Deploiement reussi !') +
          '\n\n' +
          `${chalk.cyan('URL:')}         https://${result.domain}\n` +
          `${chalk.cyan('Application:')} ${result.app_name}\n` +
          `${chalk.cyan('Version:')}     ${result.version}\n` +
          `${chalk.cyan('Namespace:')}   ${result.namespace}\n\n` +
          chalk.yellow(
            'Note: Le certificat SSL peut prendre 10-15 minutes.\n'
          ) +
          chalk.yellow(
            "L'application est accessible immediatement en HTTP."
          ),
        { padding: 1, borderColor: 'green', margin: 1 }
      )
    );
    return {
      success: true,
      url: `https://${result.domain}`,
      deployment: result,
    };
  }

  return { success: false, deployment: result };
}

module.exports = {
  initiateCloudDeploy,
  packageProject,
  pollDeploymentStatus,
};
