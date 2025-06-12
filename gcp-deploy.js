// gcp-deploy.js - Module de déploiement GCP pour le CLI TriDyme
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
const FormData = require('form-data');
const boxen = require('boxen');

// Configuration par défaut
const DEFAULT_GCP_DEPLOY_URL =
  process.env.TRIDYME_DEPLOY_URL || 'https://deploy.tridyme.com';

/**
 * Vérifie si le dossier contient un projet TriDyme valide
 * @param {string} projectPath - Chemin du projet
 * @returns {boolean} - True si le projet est valide
 */
function validateProject(projectPath) {
  const requiredPaths = [
    'backend',
    'frontend',
    'backend/main.py',
    'backend/requirements.txt',
    'frontend/package.json',
  ];

  for (const requiredPath of requiredPaths) {
    if (!fs.existsSync(path.join(projectPath, requiredPath))) {
      console.error(
        chalk.red(`❌ Fichier/dossier requis manquant: ${requiredPath}`),
      );
      return false;
    }
  }
  return true;
}

/**
 * Crée une archive ZIP du projet
 * @param {string} sourceDir - Dossier source du projet
 * @param {string} outputPath - Chemin de sortie de l'archive
 * @returns {Promise<string>} - Chemin vers l'archive créée
 */
function createProjectArchive(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Compression maximale
    });

    output.on('close', () => {
      resolve(outputPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Patterns à ignorer
    const ignorePatterns = [
      '.git',
      '.github',
      'node_modules',
      'frontend/node_modules',
      'frontend/module-federation/node_modules',
      'backend/env',
      'backend/__pycache__',
      '**/__pycache__',
      '.env.local',
      '.DS_Store',
      'Thumbs.db',
      '*.log',
      'logs/',
    ];

    // Ajouter les fichiers en excluant les patterns ignorés
    archive.glob('**/*', {
      cwd: sourceDir,
      ignore: ignorePatterns,
      dot: false,
    });

    // Finaliser l'archive
    archive.finalize();
  });
}

/**
 * Demande interactivement les informations pour le déploiement GCP
 */
async function promptGCPDeploymentInfo() {
  // Générer un nom par défaut basé sur le dossier actuel
  const currentFolder = path.basename(process.cwd());
  const defaultProjectName = currentFolder
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/^-+|-+$/g, ''); // Enlever les tirets en début/fin

  console.log(chalk.blue('\n🚀 Configuration du déploiement GCP\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'deployUrl',
      message: 'URL du serveur de déploiement TriDyme:',
      default: DEFAULT_GCP_DEPLOY_URL,
      validate: (input) => {
        try {
          new URL(input);
          return true;
        } catch {
          return 'Veuillez entrer une URL valide';
        }
      },
    },
    {
      type: 'input',
      name: 'projectName',
      message: "Nom du projet (utilisé pour l'URL et les ressources):",
      default: defaultProjectName,
      validate: (input) => {
        if (!input.trim()) return 'Le nom du projet est requis';
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Le nom doit contenir uniquement des lettres minuscules, des chiffres et des tirets';
        }
        if (input.length > 30) {
          return 'Le nom ne peut pas dépasser 30 caractères';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'environment',
      message: 'Environnement de déploiement:',
      choices: [
        {
          name: '🧪 Développement (dev.tridyme.com)',
          value: 'development',
        },
        {
          name: '🚀 Production (tridyme.com)',
          value: 'production',
        },
      ],
      default: 'development',
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'Clé API TriDyme (optionnel):',
      when: (answers) => {
        // Demander la clé API seulement pour la production
        return answers.environment === 'production';
      },
    },
    {
      type: 'confirm',
      name: 'buildBeforeDeploy',
      message: 'Construire le frontend avant le déploiement?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'confirmDeploy',
      message: (answers) => {
        const url = `https://${answers.projectName}-${answers.environment}.tridyme.com`;
        return `Déployer sur ${chalk.cyan(url)}?`;
      },
      default: true,
    },
  ]);

  return answers;
}

/**
 * Construit le frontend avant le déploiement
 * @param {string} projectPath - Chemin du projet
 */
async function buildFrontend(projectPath) {
  const spinner = ora('Construction du frontend...').start();

  try {
    const { execSync } = require('child_process');

    // Vérifier si node_modules existe
    const nodeModulesPath = path.join(projectPath, 'frontend', 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      spinner.text = 'Installation des dépendances frontend...';
      execSync('npm install', {
        cwd: path.join(projectPath, 'frontend'),
        stdio: 'pipe',
      });
    }

    // Construire le projet
    spinner.text = 'Construction du frontend...';
    execSync('npm run build', {
      cwd: path.join(projectPath, 'frontend'),
      stdio: 'pipe',
    });

    spinner.succeed('Frontend construit avec succès');
  } catch (error) {
    spinner.fail('Échec de la construction du frontend');
    throw new Error(`Erreur de construction: ${error.message}`);
  }
}

/**
 * Envoie l'archive au serveur de déploiement GCP
 * @param {Object} options - Options de déploiement
 * @returns {Promise<Object>} - Résultat du déploiement
 */
async function uploadToGCPDeployService(options) {
  const { deployUrl, projectName, environment, apiKey, zipPath } = options;

  const spinner = ora('Envoi du projet au serveur de déploiement...').start();

  try {
    // Créer le formulaire multipart
    const form = new FormData();
    form.append('projectName', projectName);
    form.append('environment', environment);

    if (apiKey) {
      form.append('apiKey', apiKey);
    }

    form.append('zipFile', fs.createReadStream(zipPath), {
      filename: path.basename(zipPath),
      contentType: 'application/zip',
    });

    // Configuration de la requête
    const config = {
      headers: {
        ...form.getHeaders(),
        'User-Agent': 'TriDyme-CLI/1.0.0',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 10 * 60 * 1000, // 10 minutes timeout
    };

    // Envoyer la requête
    const response = await axios.post(`${deployUrl}/api/deploy`, form, config);

    spinner.succeed('Projet envoyé avec succès');

    return {
      success: true,
      deploymentId: response.data.deploymentId,
      version: response.data.version,
      url: response.data.url,
      environment: response.data.environment,
      logs: response.data.logs || [],
    };
  } catch (error) {
    spinner.fail("Échec de l'envoi du projet");

    let errorMessage = 'Erreur inconnue';

    if (error.response) {
      // Erreur HTTP
      const status = error.response.status;
      const data = error.response.data;

      if (status === 400) {
        errorMessage = data.error || 'Données de requête invalides';
      } else if (status === 401) {
        errorMessage = 'Authentification requise - vérifiez votre clé API';
      } else if (status === 413) {
        errorMessage = 'Fichier trop volumineux (limite: 100MB)';
      } else if (status === 429) {
        errorMessage = 'Trop de tentatives - attendez avant de réessayer';
      } else if (status >= 500) {
        errorMessage = 'Erreur serveur - réessayez plus tard';
      } else {
        errorMessage = data.error || `Erreur HTTP ${status}`;
      }
    } else if (error.request) {
      // Pas de réponse reçue
      errorMessage = 'Impossible de contacter le serveur de déploiement';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Timeout - le déploiement prend trop de temps';
    } else {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Suit l'état du déploiement
 * @param {string} deployUrl - URL du serveur de déploiement
 * @param {string} deploymentId - ID du déploiement
 * @returns {Promise<Object>} - État final du déploiement
 */
async function trackDeployment(deployUrl, deploymentId) {
  const spinner = ora('Suivi du déploiement...').start();

  try {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    let lastStatus = '';

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 secondes

      try {
        const response = await axios.get(
          `${deployUrl}/api/deploy/${deploymentId}`,
          {
            timeout: 10000,
          },
        );

        const deployment = response.data.deployment;

        if (deployment.status !== lastStatus) {
          lastStatus = deployment.status;

          if (deployment.status === 'deployed') {
            spinner.succeed('Déploiement terminé avec succès');
            return {
              success: true,
              url: deployment.url,
              version: deployment.version,
              details: deployment,
            };
          } else if (deployment.status === 'failed') {
            spinner.fail(
              `Déploiement échoué: ${deployment.error || 'Erreur inconnue'}`,
            );
            return {
              success: false,
              error: deployment.error || 'Déploiement échoué',
              details: deployment,
            };
          } else {
            spinner.text = `Déploiement en cours: ${deployment.status}`;
          }
        }
      } catch (trackError) {
        // Erreur de tracking, on continue
        console.log(
          chalk.yellow(
            `⚠️ Erreur de suivi (tentative ${attempts + 1}): ${
              trackError.message
            }`,
          ),
        );
      }

      attempts++;
    }

    spinner.warn('Le suivi a pris trop de temps - vérifiez manuellement');
    return {
      success: false,
      error: 'Timeout du suivi de déploiement',
    };
  } catch (error) {
    spinner.fail('Erreur lors du suivi du déploiement');
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Fonction principale pour déployer sur GCP
 * @param {Object} options - Options de déploiement
 */
async function deployToGCP(options = {}) {
  const projectPath = options.projectPath || process.cwd();

  console.log(
    chalk.blue('🌐 Déploiement sur Google Cloud Platform avec GKE\n'),
  );

  try {
    // Vérifier que le projet est valide
    if (!validateProject(projectPath)) {
      return {
        success: false,
        error: 'Structure de projet TriDyme invalide',
      };
    }

    // Demander les informations de déploiement
    let deployInfo = {
      deployUrl: options.deployUrl || DEFAULT_GCP_DEPLOY_URL,
      projectName: options.projectName,
      environment: options.environment || 'development',
      apiKey: options.apiKey,
      buildBeforeDeploy: options.buildBeforeDeploy !== false,
    };

    // Si les informations ne sont pas fournies, les demander interactivement
    if (!deployInfo.projectName) {
      const promptInfo = await promptGCPDeploymentInfo();

      if (!promptInfo.confirmDeploy) {
        console.log(chalk.yellow('Déploiement annulé.'));
        return { success: false, cancelled: true };
      }

      deployInfo = { ...deployInfo, ...promptInfo };
    }

    // Construire le frontend si demandé
    if (deployInfo.buildBeforeDeploy) {
      await buildFrontend(projectPath);
    }

    // Créer une archive ZIP temporaire
    const tmpDir = path.join(os.tmpdir(), `tridyme-gcp-deploy-${Date.now()}`);
    fs.ensureDirSync(tmpDir);

    const zipPath = path.join(tmpDir, `${deployInfo.projectName}.zip`);

    console.log(chalk.blue("📦 Création de l'archive du projet..."));
    await createProjectArchive(projectPath, zipPath);

    const zipStats = fs.statSync(zipPath);
    const zipSizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
    console.log(chalk.green(`✅ Archive créée: ${zipSizeMB} MB`));

    // Envoyer l'archive au serveur de déploiement
    console.log(chalk.blue('🚀 Envoi vers le serveur de déploiement GCP...'));

    const uploadResult = await uploadToGCPDeployService({
      deployUrl: deployInfo.deployUrl,
      projectName: deployInfo.projectName,
      environment: deployInfo.environment,
      apiKey: deployInfo.apiKey,
      zipPath,
    });

    // Nettoyage du fichier temporaire
    fs.removeSync(tmpDir);

    if (!uploadResult.success) {
      return uploadResult;
    }

    console.log(chalk.green('✅ Projet envoyé avec succès'));
    console.log(
      chalk.blue(`📋 ID de déploiement: ${uploadResult.deploymentId}`),
    );
    console.log(chalk.blue(`🏷️  Version: ${uploadResult.version}`));

    // Suivre le déploiement
    console.log(chalk.blue('👀 Suivi du déploiement en cours...'));
    const deploymentResult = await trackDeployment(
      deployInfo.deployUrl,
      uploadResult.deploymentId,
    );

    if (deploymentResult.success) {
      // Afficher le résultat final
      console.log(
        boxen(
          chalk.green.bold('🎉 Déploiement GCP réussi! 🎉') +
            '\n\n' +
            `${chalk.cyan("🌐 URL de l'application:")} ${
              deploymentResult.url
            }\n` +
            `${chalk.cyan('🏷️  Version:')} ${deploymentResult.version}\n` +
            `${chalk.cyan('🌍 Environnement:')} ${deployInfo.environment}\n` +
            `${chalk.cyan('📋 ID de déploiement:')} ${
              uploadResult.deploymentId
            }`,
          {
            padding: 1,
            borderColor: 'green',
            margin: 1,
          },
        ),
      );

      // Informations supplémentaires
      console.log(chalk.blue('\n📚 Informations utiles:'));
      console.log(
        chalk.white(
          `• Surveillance: ${deployInfo.deployUrl}/api/deploy/${uploadResult.deploymentId}`,
        ),
      );
      console.log(
        chalk.white(`• Logs: Consultez les logs dans l'interface GCP`),
      );
      console.log(
        chalk.white(
          `• Rollback: tridyme rollback --project=${deployInfo.projectName} --env=${deployInfo.environment}`,
        ),
      );

      return {
        success: true,
        deploymentId: uploadResult.deploymentId,
        version: deploymentResult.version,
        url: deploymentResult.url,
        environment: deployInfo.environment,
      };
    } else {
      // Afficher l'erreur
      console.log(
        boxen(
          chalk.red.bold('❌ Déploiement GCP échoué') +
            '\n\n' +
            `${chalk.red('Erreur:')} ${deploymentResult.error}\n` +
            `${chalk.yellow('ID de déploiement:')} ${
              uploadResult.deploymentId
            }`,
          {
            padding: 1,
            borderColor: 'red',
            margin: 1,
          },
        ),
      );

      return deploymentResult;
    }
  } catch (error) {
    console.error(
      chalk.red(`❌ Erreur lors du déploiement GCP: ${error.message}`),
    );

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Effectue un rollback d'un déploiement
 * @param {Object} options - Options de rollback
 */
async function rollbackGCPDeployment(options = {}) {
  try {
    const { deployUrl, projectName, environment, version } = options;

    if (!deployUrl || !projectName || !environment || !version) {
      // Demander les informations manquantes
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'deployUrl',
          message: 'URL du serveur de déploiement:',
          default: DEFAULT_GCP_DEPLOY_URL,
          when: !deployUrl,
        },
        {
          type: 'input',
          name: 'projectName',
          message: 'Nom du projet:',
          when: !projectName,
          validate: (input) =>
            input.trim() ? true : 'Le nom du projet est requis',
        },
        {
          type: 'list',
          name: 'environment',
          message: 'Environnement:',
          choices: ['development', 'production'],
          when: !environment,
        },
        {
          type: 'input',
          name: 'version',
          message: 'Version vers laquelle revenir:',
          when: !version,
          validate: (input) => (input.trim() ? true : 'La version est requise'),
        },
      ]);

      Object.assign(options, answers);
    }

    const spinner = ora('Rollback en cours...').start();

    const response = await axios.post(`${options.deployUrl}/api/rollback`, {
      projectName: options.projectName,
      environment: options.environment,
      version: options.version,
    });

    spinner.succeed('Rollback effectué avec succès');

    console.log(
      boxen(
        chalk.green.bold('🔄 Rollback réussi!') +
          '\n\n' +
          `${chalk.cyan('Projet:')} ${options.projectName}\n` +
          `${chalk.cyan('Environnement:')} ${options.environment}\n` +
          `${chalk.cyan('Version:')} ${options.version}`,
        {
          padding: 1,
          borderColor: 'green',
          margin: 1,
        },
      ),
    );

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors du rollback: ${error.message}`));

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Liste les déploiements actifs
 * @param {Object} options - Options de listage
 */
async function listGCPDeployments(options = {}) {
  try {
    const { deployUrl, environment } = options;

    let actualDeployUrl = deployUrl || DEFAULT_GCP_DEPLOY_URL;
    let actualEnvironment = environment;

    if (!actualEnvironment) {
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'environment',
          message: 'Environnement à consulter:',
          choices: [
            { name: 'Développement', value: 'development' },
            { name: 'Production', value: 'production' },
            { name: 'Tous', value: 'all' },
          ],
        },
      ]);
      actualEnvironment = answer.environment;
    }

    const spinner = ora('Récupération des déploiements...').start();

    const url =
      actualEnvironment === 'all'
        ? `${actualDeployUrl}/api/deployments`
        : `${actualDeployUrl}/api/deployments?environment=${actualEnvironment}`;

    const response = await axios.get(url);

    spinner.succeed('Déploiements récupérés');

    if (response.data.deployments && response.data.deployments.length > 0) {
      console.log(chalk.blue('\n📋 Déploiements actifs:\n'));

      response.data.deployments.forEach((deployment) => {
        const status =
          deployment.readyReplicas === deployment.replicas ? '✅' : '⚠️';
        const version = deployment.version || 'N/A';
        const date = new Date(deployment.creationTimestamp).toLocaleString();

        console.log(`${status} ${chalk.cyan(deployment.name)}`);
        console.log(`   Version: ${chalk.yellow(version)}`);
        console.log(
          `   Replicas: ${deployment.readyReplicas}/${deployment.replicas}`,
        );
        console.log(`   Créé: ${date}`);
        console.log('');
      });
    } else {
      console.log(chalk.yellow('Aucun déploiement trouvé'));
    }

    return {
      success: true,
      deployments: response.data.deployments,
    };
  } catch (error) {
    console.error(
      chalk.red(`❌ Erreur lors de la récupération: ${error.message}`),
    );

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Vérifie le statut du serveur de déploiement
 * @param {string} deployUrl - URL du serveur
 */
async function checkGCPDeployServerStatus(deployUrl = DEFAULT_GCP_DEPLOY_URL) {
  try {
    const spinner = ora('Vérification du serveur de déploiement...').start();

    const response = await axios.get(`${deployUrl}/health`, {
      timeout: 5000,
    });

    spinner.succeed('Serveur de déploiement accessible');

    console.log(chalk.green('✅ Serveur de déploiement GCP opérationnel'));
    console.log(chalk.blue(`📡 URL: ${deployUrl}`));
    console.log(chalk.blue(`⏰ Timestamp: ${response.data.timestamp}`));

    return {
      success: true,
      status: response.data,
    };
  } catch (error) {
    console.error(
      chalk.red(`❌ Serveur de déploiement inaccessible: ${error.message}`),
    );
    console.log(
      chalk.yellow('💡 Vérifiez que le serveur de déploiement est démarré'),
    );

    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  deployToGCP,
  rollbackGCPDeployment,
  listGCPDeployments,
  checkGCPDeployServerStatus,
  validateProject,
  createProjectArchive,
};
