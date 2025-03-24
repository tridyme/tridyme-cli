// tridyme-cloud-deploy.js
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

// URL du service de déploiement TriDyme - Remplacer par l'URL réelle
const TRIDYME_DEPLOY_SERVICE_URL = 'https://deploy.tridyme.com/api/deploy';
// Clé API du service - Remplacer par la véritable méthode d'authentification
const TRIDYME_API_KEY = process.env.TRIDYME_API_KEY;

/**
 * Vérifie si le dossier contient un projet TriDyme valide
 * @param {string} projectPath - Chemin du projet
 * @returns {boolean} - True si le projet est valide
 */
function validateProject(projectPath) {
  return (
    fs.existsSync(path.join(projectPath, 'backend')) &&
    fs.existsSync(path.join(projectPath, 'frontend'))
  );
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
      zlib: { level: 9 }, // Niveau de compression maximum
    });

    output.on('close', () => {
      resolve(outputPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Ignorer les dossiers et fichiers qui ne sont pas nécessaires
    const ignorePatterns = [
      '.git',
      '.github',
      'node_modules',
      'frontend/node_modules',
      'frontend/module-federation/node_modules',
      'backend/env',
      '__pycache__',
      '.env',
      '.env.*',
    ];

    // Ajouter le contenu du projet à l'archive
    archive.glob('**/*', {
      cwd: sourceDir,
      ignore: ignorePatterns,
    });

    // Finaliser l'archive
    archive.finalize();
  });
}

/**
 * Demande interactivement les informations pour le déploiement
 */
async function promptDeploymentInfo() {
  // Générer un nom par défaut basé sur le dossier actuel
  const currentFolder = path.basename(process.cwd());
  const defaultProjectName = `${currentFolder
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')}`;

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Nom du projet:',
      default: defaultProjectName,
      validate: (input) => {
        if (!input.trim()) return 'Le nom du projet est requis';
        if (!/^[a-z0-9-]+$/.test(input))
          return 'Le nom doit contenir uniquement des lettres minuscules, des chiffres et des tirets';
        return true;
      },
    },
    {
      type: 'input',
      name: 'apiKey',
      message: 'Clé API TriDyme:',
      default: TRIDYME_API_KEY || '',
      validate: (input) => (input.trim() ? true : 'La clé API est requise'),
      when: !TRIDYME_API_KEY,
    },
    {
      type: 'list',
      name: 'environment',
      message: 'Environnement de déploiement:',
      choices: [
        { name: 'Développement', value: 'development' },
        { name: 'Production', value: 'production' },
        { name: 'Test', value: 'test' },
      ],
      default: 'development',
    },
    {
      type: 'confirm',
      name: 'confirmDeploy',
      message: 'Êtes-vous prêt à déployer?',
      default: true,
    },
  ]);

  return answers;
}

/**
 * Envoie l'archive au service de déploiement TriDyme
 * @param {Object} options - Options de déploiement
 * @param {string} options.apiKey - Clé API TriDyme
 * @param {string} options.projectName - Nom du projet
 * @param {string} options.zipPath - Chemin vers le fichier ZIP
 * @param {string} options.environment - Environnement de déploiement
 * @returns {Promise<Object>} - Résultat du déploiement
 */
async function uploadToTriDymeService(options) {
  const spinner = ora(
    'Envoi du projet au service de déploiement TriDyme...',
  ).start();

  try {
    // Créer un formulaire multipart
    const form = new FormData();
    form.append('apiKey', options.apiKey);
    form.append('projectName', options.projectName);
    form.append('environment', options.environment);
    form.append('deploymentType', 'web');
    form.append('zipFile', fs.createReadStream(options.zipPath), {
      filename: path.basename(options.zipPath),
      contentType: 'application/zip',
    });

    // Envoyer la requête au service de déploiement
    const response = await axios.post(TRIDYME_DEPLOY_SERVICE_URL, form, {
      headers: {
        ...form.getHeaders(),
        'X-API-KEY': options.apiKey,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    spinner.succeed('Projet envoyé avec succès');

    return {
      success: true,
      deploymentId: response.data.deploymentId,
      url: response.data.deploymentUrl,
      details: response.data,
    };
  } catch (error) {
    spinner.fail("Échec de l'envoi du projet");

    if (error.response) {
      console.error(
        chalk.red(
          `Erreur API TriDyme (${error.response.status}): ${JSON.stringify(
            error.response.data,
          )}`,
        ),
      );
    } else {
      console.error(chalk.red(`Erreur: ${error.message}`));
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Suit l'état du déploiement
 * @param {string} deploymentId - ID du déploiement
 * @param {string} apiKey - Clé API TriDyme
 * @returns {Promise<Object>} - État final du déploiement
 */
async function trackDeployment(deploymentId, apiKey) {
  const spinner = ora('Suivi du déploiement en cours...').start();

  try {
    let isDeployed = false;
    let attempts = 0;
    let deploymentStatus = {};

    while (!isDeployed && attempts < 30) {
      // Attendre 5 secondes entre chaque vérification
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const response = await axios.get(
        `${TRIDYME_DEPLOY_SERVICE_URL}/status/${deploymentId}`,
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        },
      );

      deploymentStatus = response.data;

      spinner.text = `Déploiement en cours: ${deploymentStatus.status} (${
        deploymentStatus.progress || 0
      }%)`;

      if (deploymentStatus.status === 'success') {
        isDeployed = true;
        spinner.succeed('Déploiement terminé avec succès');
      } else if (deploymentStatus.status === 'failed') {
        spinner.fail(
          `Échec du déploiement: ${
            deploymentStatus.error || 'Erreur inconnue'
          }`,
        );
        return {
          success: false,
          error: deploymentStatus.error || 'Échec du déploiement',
        };
      }

      attempts++;
    }

    if (!isDeployed) {
      spinner.warn(
        'Le déploiement prend plus de temps que prévu. Veuillez vérifier son état sur le tableau de bord TriDyme.',
      );
    }

    return {
      success: isDeployed,
      url: deploymentStatus.url,
      details: deploymentStatus,
    };
  } catch (error) {
    spinner.fail('Erreur lors du suivi du déploiement');

    if (error.response) {
      console.error(
        chalk.red(
          `Erreur API TriDyme (${error.response.status}): ${JSON.stringify(
            error.response.data,
          )}`,
        ),
      );
    } else {
      console.error(chalk.red(`Erreur: ${error.message}`));
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Fonction principale pour déployer via le service TriDyme
 * @param {Object} options - Options de déploiement
 */
async function deployToTriDymeCloud(options = {}) {
  const projectPath = options.projectPath || process.cwd();

  // Vérifier que le projet est valide
  if (!validateProject(projectPath)) {
    console.error(
      chalk.red('Ce dossier ne semble pas être un projet TriDyme valide.'),
    );
    return { success: false, error: 'Projet invalide' };
  }

  try {
    // Demander les informations de déploiement si non fournies
    let deployInfo = {
      projectName: options.projectName,
      apiKey: options.apiKey || TRIDYME_API_KEY,
      environment: options.environment || 'development',
    };

    if (!deployInfo.projectName || !deployInfo.apiKey) {
      const promptInfo = await promptDeploymentInfo();

      if (!promptInfo.confirmDeploy) {
        console.log(chalk.yellow('Déploiement annulé.'));
        return { success: false, cancelled: true };
      }

      deployInfo = {
        ...deployInfo,
        projectName: promptInfo.projectName || deployInfo.projectName,
        apiKey: promptInfo.apiKey || deployInfo.apiKey,
        environment: promptInfo.environment || deployInfo.environment,
      };
    }

    // Construire le projet pour la production
    if (options.build !== false) {
      // Permettre de sauter l'étape de build si nécessaire
      console.log(chalk.blue('Construction du projet pour le déploiement...'));

      try {
        // Créer le dossier build s'il n'existe pas
        await fs.ensureDir(path.join(projectPath, 'frontend', 'build'));

        // Exécuter le build de frontend
        const { execSync } = require('child_process');
        execSync('cd frontend && npm run build', {
          cwd: projectPath,
          stdio: 'inherit',
        });
      } catch (error) {
        console.error(chalk.red('Échec de la construction du projet.'));
        console.error(chalk.red(`Erreur: ${error.message}`));
        return { success: false, error: error.message };
      }
    }

    // Créer une archive ZIP temporaire
    const tmpDir = path.join(os.tmpdir(), `tridyme-deploy-${Date.now()}`);
    fs.ensureDirSync(tmpDir);
    const zipPath = path.join(tmpDir, `${deployInfo.projectName}.zip`);

    console.log(chalk.blue("Création de l'archive du projet..."));
    await createProjectArchive(projectPath, zipPath);
    console.log(chalk.green('Archive créée avec succès'));

    // Envoyer l'archive au service de déploiement TriDyme
    console.log(
      chalk.blue('Envoi du projet au service de déploiement TriDyme...'),
    );
    const uploadResult = await uploadToTriDymeService({
      ...deployInfo,
      zipPath,
    });

    // Nettoyage du dossier temporaire
    fs.removeSync(tmpDir);

    if (!uploadResult.success) {
      return uploadResult;
    }

    // Suivre l'état du déploiement
    console.log(chalk.blue('Suivi du déploiement en cours...'));
    const deploymentResult = await trackDeployment(
      uploadResult.deploymentId,
      deployInfo.apiKey,
    );

    if (deploymentResult.success) {
      console.log(
        boxen(
          chalk.green.bold('✨ Déploiement réussi! ✨') +
            '\n\n' +
            `Votre application est maintenant disponible à l'adresse:\n` +
            `${chalk.cyan(deploymentResult.url)}\n\n` +
            `Environnement: ${chalk.cyan(deployInfo.environment)}`,
          { padding: 1, borderColor: 'green', margin: 1 },
        ),
      );
    }

    return deploymentResult;
  } catch (error) {
    console.error(chalk.red(`Erreur lors du déploiement: ${error.message}`));

    return { success: false, error: error.message };
  }
}

module.exports = {
  deployToTriDymeCloud,
};
