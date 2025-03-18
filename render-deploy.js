// render-deploy.js
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const archiver = require('archiver');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Fonction pour déployer directement sur Render sans Git
 * @param {Object} options - Options de déploiement
 * @param {string} options.apiKey - Clé API Render
 * @param {string} options.projectName - Nom du projet
 * @param {string} options.projectPath - Chemin du projet
 */
async function deployToRender(options = {}) {
  const spinner = ora('Préparation du déploiement sur Render...').start();

  try {
    // Valider les options
    if (!options.apiKey) {
      spinner.fail('Clé API Render non fournie');
      throw new Error(
        'Une clé API Render est requise pour le déploiement direct',
      );
    }

    const projectPath = options.projectPath || process.cwd();
    const projectName = options.projectName || path.basename(projectPath);

    // Créer un dossier temporaire pour l'archive
    const tmpDir = path.join(os.tmpdir(), `tridyme-deploy-${Date.now()}`);
    fs.ensureDirSync(tmpDir);

    const archivePath = path.join(tmpDir, `${projectName}.tar.gz`);

    // Préparer l'archive
    spinner.text = "Création de l'archive du projet...";
    await createProjectArchive(projectPath, archivePath);

    // Uploader l'archive vers Render
    spinner.text = "Envoi de l'archive vers Render...";
    const deploymentId = await uploadToRender({
      apiKey: options.apiKey,
      archivePath,
      projectName,
    });

    // Suivre le déploiement
    spinner.text = 'Déploiement en cours...';
    await trackDeployment(options.apiKey, deploymentId);

    // Nettoyage
    fs.removeSync(tmpDir);

    spinner.succeed('Déploiement terminé avec succès');

    return {
      success: true,
      url: `https://${projectName}.onrender.com`,
    };
  } catch (error) {
    spinner.fail('Échec du déploiement');
    console.error(chalk.red(`Erreur: ${error.message}`));
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Crée une archive du projet
 * @param {string} sourceDir - Dossier source du projet
 * @param {string} outputPath - Chemin de sortie de l'archive
 */
function createProjectArchive(sourceDir, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('tar', {
      gzip: true,
    });

    output.on('close', () => resolve(outputPath));
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    // Ignorer les dossiers et fichiers qui ne sont pas nécessaires pour le déploiement
    const ignorePatterns = [
      '.git',
      '.github',
      'node_modules',
      'frontend/node_modules',
      'frontend/module-federation/node_modules',
      'backend/env',
      '__pycache__',
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
 * Envoie l'archive au service Render
 * @param {Object} options - Options d'upload
 * @param {string} options.apiKey - Clé API Render
 * @param {string} options.archivePath - Chemin de l'archive
 * @param {string} options.projectName - Nom du projet
 */
async function uploadToRender(options) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(options.archivePath));
  formData.append('name', options.projectName);

  // Configuration pour créer un service web
  formData.append('type', 'web_service');
  formData.append('env', 'python');
  formData.append('buildCommand', 'cd frontend && npm run build');
  formData.append(
    'startCommand',
    'uvicorn backend.main:app --host 0.0.0.0 --port $PORT',
  );

  try {
    const response = await axios.post(
      'https://api.render.com/v1/services',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${options.apiKey}`,
        },
      },
    );

    return response.data.id;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Erreur API Render: ${
          error.response.data.message || JSON.stringify(error.response.data)
        }`,
      );
    }
    throw error;
  }
}

/**
 * Suit l'état du déploiement
 * @param {string} apiKey - Clé API Render
 * @param {string} deploymentId - ID du déploiement
 */
async function trackDeployment(apiKey, deploymentId) {
  let isDeployed = false;
  let attempts = 0;

  while (!isDeployed && attempts < 30) {
    try {
      const response = await axios.get(
        `https://api.render.com/v1/services/${deploymentId}/deploys/latest`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );

      const status = response.data.status;

      if (status === 'live') {
        isDeployed = true;
      } else if (['failed', 'canceled', 'deactivated'].includes(status)) {
        throw new Error(`Déploiement terminé avec le statut: ${status}`);
      } else {
        // Attendre avant de vérifier à nouveau
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
      }
    } catch (error) {
      if (attempts >= 5) {
        throw error;
      }
      // Attendre avant de réessayer en cas d'erreur
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }
  }

  if (!isDeployed) {
    throw new Error(
      'Le déploiement a pris trop de temps ou a rencontré un problème',
    );
  }

  return true;
}

/**
 * Interactivement demande les informations de déploiement à l'utilisateur
 */
async function promptDeploymentInfo() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Entrez votre clé API Render:',
      validate: (input) => (input.length > 0 ? true : 'La clé API est requise'),
    },
    {
      type: 'input',
      name: 'projectName',
      message: 'Nom du service sur Render (slug, sans espaces):',
      default: path.basename(process.cwd()),
      validate: (input) =>
        /^[a-z0-9-]+$/.test(input)
          ? true
          : 'Le nom doit être un slug valide (lettres minuscules, chiffres, tirets)',
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

module.exports = {
  deployToRender,
  promptDeploymentInfo,
};
