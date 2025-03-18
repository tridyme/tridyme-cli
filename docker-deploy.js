// docker-deploy.js
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');

/**
 * Vérifie si Docker est installé sur le système
 * @returns {boolean} - True si Docker est installé et opérationnel
 */
function checkDockerInstalled() {
  try {
    execSync('docker --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Vérifie que le dossier contient un projet TriDyme valide avec un Dockerfile
 * @param {string} projectPath - Chemin du projet
 * @returns {boolean} - True si le projet est valide
 */
function validateProject(projectPath) {
  return (
    fs.existsSync(path.join(projectPath, 'Dockerfile')) &&
    fs.existsSync(path.join(projectPath, 'backend')) &&
    fs.existsSync(path.join(projectPath, 'frontend'))
  );
}

/**
 * Construit l'image Docker du projet
 * @param {Object} options - Options de construction
 * @param {string} options.projectPath - Chemin du projet
 * @param {string} options.imageName - Nom de l'image
 * @param {string} options.imageTag - Tag de l'image
 * @returns {Promise<string>} - Nom complet de l'image construite
 */
async function buildDockerImage(options) {
  const { projectPath, imageName, imageTag } = options;
  const fullImageName = `${imageName}:${imageTag}`;

  const spinner = ora("Construction de l'image Docker...").start();

  try {
    // S'assurer que le frontend est construit avant la création de l'image Docker
    spinner.text = 'Construction du frontend...';
    execSync('npm run build', {
      cwd: path.join(projectPath, 'frontend'),
      stdio: 'pipe',
    });

    // Construire l'image Docker
    spinner.text = "Construction de l'image Docker...";
    execSync(`docker build -t ${fullImageName} .`, {
      cwd: projectPath,
      stdio: 'pipe',
    });

    spinner.succeed('Image Docker construite avec succès');
    return fullImageName;
  } catch (error) {
    spinner.fail("Échec de la construction de l'image Docker");
    throw new Error(
      `Erreur lors de la construction de l'image Docker: ${error.message}`,
    );
  }
}

/**
 * Déploie l'application sur Render en utilisant l'API avec l'image Docker
 * @param {Object} options - Options de déploiement
 * @param {string} options.apiKey - Clé API Render
 * @param {string} options.dockerFile - Chemin vers le Dockerfile
 * @param {string} options.projectName - Nom du projet
 * @returns {Promise<Object>} - Résultat du déploiement
 */
async function deployDockerToRenderAPI(options) {
  const { apiKey, dockerFile, projectName, envVars = [] } = options;

  const spinner = ora(
    "Préparation du déploiement Docker via l'API Render...",
  ).start();

  try {
    // Lire le contenu du Dockerfile
    const dockerfileContent = fs.readFileSync(dockerFile, 'utf8');

    // Créer la requête à l'API Render
    const response = await axios.post(
      'https://api.render.com/v1/services',
      {
        type: 'web_service',
        name: projectName,
        serviceDetails: {
          type: 'docker',
          dockerfilePath: './Dockerfile',
          dockerContext: './',
          env: 'docker',
          envVars: [{ key: 'PORT', value: '8000' }, ...envVars],
          dockerCommand: null,
          numInstances: 1,
          plan: 'starter',
          region: 'oregon',
          branch: 'main',
          pullRequestPreviewsEnabled: false,
          autoDeploy: true,
        },
        dockerfile: {
          content: dockerfileContent,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    spinner.succeed('Service créé avec succès sur Render');

    return {
      success: true,
      serviceId: response.data.id,
      url: `https://${response.data.slug}.onrender.com`,
      details: response.data,
    };
  } catch (error) {
    spinner.fail('Échec du déploiement sur Render');

    if (error.response) {
      // Une réponse a été reçue de l'API mais avec un code d'erreur
      const statusCode = error.response.status;
      const errorMessage =
        error.response.data.message || JSON.stringify(error.response.data);

      if (statusCode === 520) {
        throw new Error(
          `Erreur 520: L'API Render est temporairement indisponible. Veuillez réessayer plus tard.`,
        );
      } else {
        throw new Error(`Erreur API Render (${statusCode}): ${errorMessage}`);
      }
    } else if (error.request) {
      // La requête a été envoyée mais aucune réponse n'a été reçue
      throw new Error(
        `Aucune réponse reçue de l'API Render. Vérifiez votre connexion internet.`,
      );
    } else {
      // Une erreur est survenue lors de la configuration de la requête
      throw new Error(
        `Erreur lors de la configuration de la requête: ${error.message}`,
      );
    }
  }
}

/**
 * Extrait les variables d'environnement du fichier .env
 * @param {string} envFilePath - Chemin vers le fichier .env
 * @returns {Array<Object>} - Tableau des variables d'environnement au format { key, value }
 */
function extractEnvVars(envFilePath) {
  if (!fs.existsSync(envFilePath)) {
    return [];
  }

  const envContent = fs.readFileSync(envFilePath, 'utf8');
  const envVars = [];

  // Parcourir chaque ligne du fichier .env
  envContent.split('\n').forEach((line) => {
    // Ignorer les lignes vides ou les commentaires
    if (!line || line.startsWith('#')) return;

    // Extraire la clé et la valeur (format KEY=VALUE)
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();

      if (key && value) {
        envVars.push({ key, value });
      }
    }
  });

  return envVars;
}

/**
 * Fonction principale pour déployer avec Docker via l'API Render
 * @param {Object} options - Options de déploiement
 */
async function deployWithDocker(options = {}) {
  const projectPath = options.projectPath || process.cwd();

  // Vérifier que Docker est installé
  if (!checkDockerInstalled()) {
    console.error(
      chalk.red("Docker n'est pas installé ou n'est pas accessible."),
    );
    console.log(
      chalk.yellow(
        'Veuillez installer Docker: https://docs.docker.com/get-docker/',
      ),
    );
    return { success: false, error: 'Docker non installé' };
  }

  // Vérifier que le projet est valide
  if (!validateProject(projectPath)) {
    console.error(
      chalk.red(
        'Ce dossier ne semble pas être un projet TriDyme valide avec un Dockerfile.',
      ),
    );
    return { success: false, error: 'Projet invalide' };
  }

  try {
    // Demander la clé API Render si non fournie
    let apiKey = options.apiKey;
    if (!apiKey) {
      const apiKeyPrompt = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: 'Entrez votre clé API Render:',
          validate: (input) =>
            input.trim() !== '' ? true : 'La clé API est requise',
        },
      ]);

      apiKey = apiKeyPrompt.apiKey;
    }

    // Demander le nom du projet
    const projectNamePrompt = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Nom du service sur Render (slug, sans espaces):',
        default: path
          .basename(projectPath)
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-'),
        validate: (input) =>
          /^[a-z0-9-]+$/.test(input)
            ? true
            : 'Le nom doit être un slug valide (lettres minuscules, chiffres, tirets)',
      },
    ]);

    const projectName = projectNamePrompt.projectName;

    // Extraire les variables d'environnement du fichier .env
    const envFilePath = path.join(projectPath, '.env');
    const envVars = extractEnvVars(envFilePath);

    if (envVars.length > 0) {
      console.log(
        chalk.blue(
          `${envVars.length} variables d'environnement détectées dans le fichier .env`,
        ),
      );
    }

    // Déployer directement via l'API Render
    const deployResult = await deployDockerToRenderAPI({
      apiKey,
      dockerFile: path.join(projectPath, 'Dockerfile'),
      projectName,
      envVars,
    });

    if (deployResult.success) {
      console.log(
        boxen(
          chalk.green.bold('✨ Déploiement Docker réussi! ✨') +
            '\n\n' +
            `Votre application est en cours de déploiement et sera bientôt disponible à l'adresse:\n` +
            `${chalk.cyan(deployResult.url)}\n\n` +
            `Le déploiement initial peut prendre quelques minutes.`,
          { padding: 1, borderColor: 'green', margin: 1 },
        ),
      );

      return deployResult;
    }

    return { success: false, error: 'Échec du déploiement' };
  } catch (error) {
    console.error(
      chalk.red(`Erreur lors du déploiement Docker: ${error.message}`),
    );

    // Suggestions en cas d'erreur
    if (error.message.includes('520')) {
      console.log(
        chalk.yellow(
          "\nL'API Render semble temporairement indisponible (erreur 520).",
        ),
      );
      console.log(chalk.yellow('Suggestions:'));
      console.log(chalk.yellow('1. Attendez quelques minutes et réessayez.'));
      console.log(
        chalk.yellow(
          '2. Essayez la méthode de déploiement Git: tridyme deploy',
        ),
      );
    }

    return { success: false, error: error.message };
  }
}

module.exports = {
  deployWithDocker,
  checkDockerInstalled,
};
