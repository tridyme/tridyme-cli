#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const { execSync, spawn } = require('child_process');
const ora = require('ora');
const boxen = require('boxen');
const slugify = require('slugify');
const os = require('os');

// Version depuis package.json
const packageJson = require('./package.json');

// Fonction pour vérifier la politique d'exécution PowerShell
async function checkPowerShellExecutionPolicy() {
  if (os.platform() !== 'win32') return true;

  try {
    // Vérifier la politique d'exécution actuelle
    const policyOutput = execSync('powershell -Command "Get-ExecutionPolicy"', {
      stdio: 'pipe',
      encoding: 'utf8',
    }).trim();

    if (policyOutput === 'Restricted') {
      console.log(
        chalk.yellow(
          'La politique d\'exécution PowerShell est actuellement "Restricted".',
        ),
      );
      console.log(
        chalk.yellow("Cela peut empêcher l'exécution correcte des scripts."),
      );

      const { modifyPolicy } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'modifyPolicy',
          message:
            'Voulez-vous temporairement définir la politique sur "RemoteSigned" pour cette session?',
          default: true,
        },
      ]);

      if (modifyPolicy) {
        execSync(
          'powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process"',
          {
            stdio: 'inherit',
          },
        );
        console.log(
          chalk.green("Politique d'exécution modifiée pour cette session."),
        );
      } else {
        console.log(
          chalk.yellow(
            "Vous pourriez rencontrer des problèmes avec l'activation des environnements virtuels.",
          ),
        );
      }
    }
    return true;
  } catch (error) {
    console.log(
      chalk.yellow(
        "Impossible de vérifier la politique d'exécution PowerShell.",
      ),
    );
    return false;
  }
}

program
  .version(packageJson.version)
  .description('CLI pour créer et gérer des applications TriDyme');

// Commande pour créer un nouveau projet
program
  .command('create [nom-projet]')
  .description("Créer un nouveau projet d'application TriDyme")
  .action(async (nomProjet) => {
    try {
      // Vérifier la politique d'exécution PowerShell sur Windows
      if (os.platform() === 'win32') {
        await checkPowerShellExecutionPolicy();
      }

      // Si nom du projet n'est pas fourni, demander à l'utilisateur
      if (!nomProjet) {
        const response = await inquirer.prompt([
          {
            type: 'input',
            name: 'nomProjet',
            message: 'Entrez le nom de votre projet:',
            validate: (input) =>
              input.trim() !== ''
                ? true
                : 'Le nom du projet ne peut pas être vide',
          },
        ]);
        nomProjet = response.nomProjet;
      }

      // Slug du nom pour le dossier
      const projectSlug = slugify(nomProjet, { lower: true });
      const projectPath = path.join(process.cwd(), projectSlug);

      // Vérifier si le dossier existe déjà
      if (fs.existsSync(projectPath)) {
        console.error(chalk.red(`Le dossier ${projectSlug} existe déjà.`));
        return;
      }

      // Générer un ID MongoDB-like
      const generateMongoObjectId = () => {
        const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
        return (
          timestamp +
          'xxxxxxxxxxxxxxxx'
            .replace(/[x]/g, () => {
              return ((Math.random() * 16) | 0).toString(16);
            })
            .toLowerCase()
        );
      };

      // Demander des informations supplémentaires
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'applicationName',
          message: "Nom de l'application:",
          default: nomProjet,
          validate: (input) =>
            input.trim() !== ''
              ? true
              : "Le nom de l'application ne peut pas être vide",
        },
        {
          type: 'input',
          name: 'companyName',
          message: 'Nom de votre entreprise:',
          default: 'TriDyme',
        },
        {
          type: 'input',
          name: 'platformApiUrl',
          message: 'URL de la plateforme API:',
          default: 'https://platform.tridyme.com/api',
        },
      ]);

      // Préparer les variables pour les fichiers de configuration
      const applicationId = generateMongoObjectId();
      const applicationSlug = slugify(answers.applicationName, { lower: true });
      const renderUrl = `https://${applicationSlug}.onrender.com`;
      const platformApiToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHRyaWR5bWUuY29tIiwiX2lkIjoiNTg5OWUwYWNhNjAwNzQxNzU1NDMzOTAyIiwiaWF0IjoxNjg4NDY3NzA2fQ.FGDbvEVZnDIVNjsi0izrt-63lVndg7EnNpDK9BO1LiE';

      // Afficher un résumé
      console.log(
        boxen(
          chalk.bold('Résumé du projet à créer:') +
            '\n\n' +
            `${chalk.cyan('Nom du projet:')} ${nomProjet}\n` +
            `${chalk.cyan("Nom de l'application:")} ${
              answers.applicationName
            }\n` +
            `${chalk.cyan('Entreprise:')} ${answers.companyName}\n` +
            `${chalk.cyan("URL de l'application:")} ${renderUrl}\n` +
            `${chalk.cyan('URL de la plateforme API:')} ${
              answers.platformApiUrl
            }\n` +
            `${chalk.cyan("ID de l'application:")} ${applicationId}`,
          { padding: 1, borderColor: 'green', margin: 1 },
        ),
      );

      const confirmCreate = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Voulez-vous continuer avec ces paramètres?',
          default: true,
        },
      ]);

      if (!confirmCreate.continue) {
        console.log(chalk.yellow('Création du projet annulée.'));
        return;
      }

      // Créer le dossier du projet
      fs.mkdirSync(projectPath, { recursive: true });

      // Clone le référentiel
      const spinner = ora('Clonage du SDK TriDyme...').start();
      try {
        execSync(
          'git clone https://github.com/tridyme/sdk-webapp-python.git .',
          { cwd: projectPath, stdio: 'pipe' },
        );
        spinner.succeed('SDK TriDyme cloné avec succès');
      } catch (error) {
        spinner.fail('Échec du clonage du SDK');
        console.error(chalk.red(`Erreur lors du clonage: ${error.message}`));
        return;
      }

      // Nettoyer le dossier .git
      fs.removeSync(path.join(projectPath, '.git'));

      // S'assurer que les scripts d'initialisation sont exécutables
      try {
        if (os.platform() !== 'win32') {
          execSync('chmod +x init.sh', { cwd: projectPath, stdio: 'pipe' });
          execSync('chmod +x start.sh', { cwd: projectPath, stdio: 'pipe' });
        }
      } catch (error) {
        spinner.warn(
          'Impossible de rendre les scripts exécutables. Vous devrez peut-être le faire manuellement.',
        );
      }

      const envFilePath = path.join(projectPath, '.env');
      const envDevPath = path.join(projectPath, 'frontend', '.env.development');
      const envProdPath = path.join(projectPath, 'frontend', '.env.production');

      // Créer le contenu des fichiers .env
      const envDevContent = `ENVIRONMENT="development"
REACT_APP_LOGO="./EC2-Ferraillage.svg"
REACT_APP_COMPANY="${answers.companyName}"
REACT_APP_APPLICATION_NAME="${answers.applicationName}"
REACT_APP_APPLICATION_API_URL="http://localhost:8000"
REACT_APP_PLATFORM_API_URL="${answers.platformApiUrl}"
REACT_APP_PLATFORM_API_TOKEN="${platformApiToken}"
REACT_APP_APPLICATION_ID="${applicationId}"
NODE_PATH=./..
CI=false`;

      const envProdContent = `ENVIRONMENT="production"
REACT_APP_LOGO="./EC2-Ferraillage.svg"
REACT_APP_COMPANY="${answers.companyName}"
REACT_APP_APPLICATION_NAME="${answers.applicationName}"
REACT_APP_APPLICATION_API_URL="${renderUrl}"
REACT_APP_PLATFORM_API_URL="${answers.platformApiUrl}"
REACT_APP_PLATFORM_API_TOKEN="${platformApiToken}"
REACT_APP_APPLICATION_ID="${applicationId}"
NODE_PATH=./..
CI=false`;

      const envContent = `ENVIRONMENT="development"
REACT_APP_LOGO="./EC2-Ferraillage.svg"
REACT_APP_COMPANY="${answers.companyName}"
REACT_APP_APPLICATION_NAME="${answers.applicationName}"
REACT_APP_APPLICATION_API_URL="${renderUrl}"
REACT_APP_PLATFORM_API_URL="${answers.platformApiUrl}"
REACT_APP_PLATFORM_API_TOKEN="${platformApiToken}"
REACT_APP_APPLICATION_ID="${applicationId}"
NODE_PATH=./..
CI=false`;

      // Créer les répertoires si nécessaire
      const frontendDir = path.join(projectPath, 'frontend');
      if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
      }

      // Écrire les fichiers .env
      fs.writeFileSync(envDevPath, envDevContent);
      fs.writeFileSync(envProdPath, envProdContent);
      fs.writeFileSync(envFilePath, envContent);

      // Mettre à jour package.json
      const packageJsonPath = path.join(
        projectPath,
        'frontend',
        'package.json',
      );
      if (fs.existsSync(packageJsonPath)) {
        const packageData = fs.readJsonSync(packageJsonPath);
        packageData.name = projectSlug;
        packageData.homepage = '.';
        fs.writeJsonSync(packageJsonPath, packageData, { spaces: 2 });
      }

      // Initialiser le projet - création de l'environnement virtuel et installation des dépendances backend
      spinner.text = "Création de l'environnement Python...";
      spinner.start();

      try {
        // Créer l'environnement virtuel Python
        const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
        execSync(`cd backend && ${pythonCmd} -m venv env`, {
          cwd: projectPath,
          stdio: 'pipe',
          shell: true,
        });
        spinner.succeed('Environnement Python créé');

        // Installer les dépendances Python
        spinner.text = 'Installation des dépendances Python...';
        spinner.start();

        if (os.platform() === 'win32') {
          // Approche spécifique à Windows
          // Mise à jour de pip sans utiliser activate
          execSync(
            `cd backend && .\\env\\Scripts\\python.exe -m pip install --upgrade pip`,
            {
              cwd: projectPath,
              stdio: 'pipe',
              shell: true,
            },
          );

          // Installation des dépendances sans utiliser activate
          execSync(
            `cd backend && .\\env\\Scripts\\pip.exe install -r requirements.txt`,
            {
              cwd: projectPath,
              stdio: 'pipe',
              shell: true,
            },
          );
        } else {
          // Approche Unix/macOS
          const activateCmd = 'source env/bin/activate';
          const pipInstallCmd = `cd backend && ${activateCmd} && pip install --upgrade pip && pip install -r requirements.txt`;

          execSync(pipInstallCmd, {
            cwd: projectPath,
            stdio: 'pipe',
            shell: true,
          });
        }

        spinner.succeed('Dépendances Python installées');

        // Installer les dépendances frontend
        spinner.text = 'Installation des dépendances frontend...';
        spinner.start();

        execSync('cd frontend && npm install', {
          cwd: projectPath,
          stdio: 'pipe',
          shell: true,
        });

        execSync('cd frontend/module-federation && npm install', {
          cwd: projectPath,
          stdio: 'pipe',
          shell: true,
        });

        spinner.succeed('Dépendances frontend installées');

        // Tout a réussi
        console.log(chalk.green('✅ Projet initialisé avec succès'));
      } catch (error) {
        spinner.fail("Échec de l'initialisation du projet");
        console.error(
          chalk.red(`Erreur lors de l'initialisation: ${error.message}`),
        );

        if (os.platform() === 'win32') {
          console.log(
            chalk.yellow('\nConseils de dépannage spécifiques à Windows:'),
          );
          console.log(
            chalk.yellow(
              "- Vérifiez que vous exécutez le terminal en tant qu'administrateur",
            ),
          );
          console.log(
            chalk.yellow(
              '- Exécutez la commande: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process',
            ),
          );
          console.log(
            chalk.yellow(
              '- Assurez-vous que Python est accessible avec la commande "python" (et non python3)',
            ),
          );
          console.log(
            chalk.yellow(
              '- Vérifiez votre PATH Windows pour vous assurer que Python y figure',
            ),
          );
        }

        console.log(chalk.yellow('\nConseils généraux:'));
        console.log(
          chalk.yellow(
            '- Assurez-vous que Python est correctement installé et accessible dans le PATH',
          ),
        );
        console.log(
          chalk.yellow(
            '- Vérifiez que Node.js et npm sont correctement installés',
          ),
        );
        console.log(
          chalk.yellow(
            "- Essayez d'initialiser manuellement le projet en suivant les instructions du README",
          ),
        );
        return;
      }

      console.log(
        boxen(
          chalk.green.bold('✨ Projet créé avec succès! ✨') +
            '\n\n' +
            `${chalk.cyan('Pour démarrer votre projet:')}\n\n` +
            `  cd ${projectSlug}\n` +
            `  tridyme dev\n\n` +
            `${chalk.cyan("Pour plus d'informations:")}\n` +
            `  tridyme --help`,
          { padding: 1, borderColor: 'green', margin: 1 },
        ),
      );
    } catch (error) {
      console.error(chalk.red(`Une erreur est survenue: ${error.message}`));
    }
  });

// Commande pour démarrer le projet en mode développement
program
  .command('dev')
  .description('Lancer le projet en mode développement')
  .action(async () => {
    // Vérifier la politique d'exécution PowerShell sur Windows
    if (os.platform() === 'win32') {
      await checkPowerShellExecutionPolicy();
    }

    console.log(chalk.blue('Démarrage du projet en mode développement...'));

    // Vérifier si l'environnement virtuel Python est activé et les dépendances sont installées
    const spinner = ora("Vérification de l'environnement Python...").start();

    try {
      // Vérifier si le dossier env existe dans backend
      if (!fs.existsSync(path.join(process.cwd(), 'backend', 'env'))) {
        spinner.warn('Environnement virtuel Python non trouvé');

        // Créer l'environnement virtuel
        spinner.text = "Création de l'environnement virtuel Python...";
        spinner.start();

        const createEnvCommand =
          os.platform() === 'win32'
            ? 'python -m venv env'
            : 'python3 -m venv env';

        try {
          execSync(createEnvCommand, {
            cwd: path.join(process.cwd(), 'backend'),
            stdio: 'pipe',
          });
          spinner.succeed('Environnement virtuel Python créé');
        } catch (error) {
          spinner.fail(
            "Échec de la création de l'environnement virtuel Python",
          );
          console.error(chalk.red(`Erreur: ${error.message}`));
          console.log(
            chalk.yellow(
              'Astuce: Assurez-vous que Python est installé et ajouté au PATH.',
            ),
          );
          return;
        }
      }

      // Installer les dépendances Python
      spinner.text = 'Installation des dépendances Python...';
      spinner.start();

      try {
        if (os.platform() === 'win32') {
          // Approche spécifique à Windows
          // Mise à jour de pip sans utiliser activate
          execSync(`.\\env\\Scripts\\python.exe -m pip install --upgrade pip`, {
            cwd: path.join(process.cwd(), 'backend'),
            stdio: 'pipe',
            shell: true,
          });

          // Installation des dépendances sans utiliser activate
          execSync(`.\\env\\Scripts\\pip.exe install -r requirements.txt`, {
            cwd: path.join(process.cwd(), 'backend'),
            stdio: 'pipe',
            shell: true,
          });
        } else {
          // Approche Unix/macOS
          const activateCmd = 'source env/bin/activate';
          const pipInstallCmd = `${activateCmd} && pip install -r requirements.txt`;

          execSync(pipInstallCmd, {
            cwd: path.join(process.cwd(), 'backend'),
            stdio: 'pipe',
            shell: true,
          });
        }

        spinner.succeed('Dépendances Python installées');
      } catch (error) {
        spinner.fail("Échec de l'installation des dépendances Python");
        console.error(chalk.red(`Erreur: ${error.message}`));
        return;
      }

      spinner.succeed('Environnement Python prêt');
    } catch (error) {
      spinner.fail("Erreur lors de la vérification de l'environnement Python");
      console.error(chalk.red(`Erreur: ${error.message}`));
      return;
    }

    // Lancer le backend avec l'environnement virtuel
    let backendProcess;
    if (os.platform() === 'win32') {
      // Approche spécifique à Windows
      backendProcess = spawn('env\\Scripts\\python.exe main.py', {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
        shell: true,
      });
    } else {
      // Approche Unix/macOS
      const backendCmd = 'source env/bin/activate && python main.py';
      backendProcess = spawn(backendCmd, {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
        shell: true,
      });
    }

    // Attendre un peu que le backend démarre
    setTimeout(() => {
      // Lancer le frontend
      const frontendProcess = spawn('npm', ['run', 'start'], {
        cwd: path.join(process.cwd(), 'frontend'),
        stdio: 'inherit',
        shell: true,
      });

      process.on('SIGINT', () => {
        backendProcess.kill('SIGINT');
        frontendProcess.kill('SIGINT');
        process.exit();
      });

      frontendProcess.on('close', (code) => {
        if (code !== 0) {
          console.log(
            chalk.red(
              `Le processus frontend s'est arrêté avec le code: ${code}`,
            ),
          );
        }
        backendProcess.kill('SIGINT');
        process.exit(code);
      });
    }, 2000);

    backendProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(
          chalk.red(`Le processus backend s'est arrêté avec le code: ${code}`),
        );
        console.log(
          chalk.yellow(
            "Astuce: Vérifiez les journaux ci-dessus pour plus de détails sur l'erreur.",
          ),
        );
        process.exit(code);
      }
    });
  });

// Commande pour construire le projet
program
  .command('build')
  .description('Construire le projet pour la production')
  .action(() => {
    console.log(chalk.blue('Construction du projet pour la production...'));

    try {
      execSync('cd frontend && npm run build', { stdio: 'inherit' });
      console.log(chalk.green('✅ Projet construit avec succès!'));
    } catch (error) {
      console.error(
        chalk.red(`Erreur lors de la construction: ${error.message}`),
      );
    }
  });

// Importation du module de déploiement Render
const renderDeploy = require('./render-deploy');
// Importation du module de déploiement Docker
const dockerDeploy = require('./docker-deploy');

// Commande pour déployer sur Render
program
  .command('deploy')
  .description("Déployer l'application sur Render")
  .option(
    '--direct',
    'Déployer directement sans utiliser Git (nécessite une clé API Render)',
  )
  .option('--api-key <key>', 'Clé API Render pour le déploiement direct')
  .option('--docker', 'Déployer via Docker')
  .action(async (options) => {
    console.log(chalk.blue('Préparation du déploiement sur Render...'));

    // Vérifier si nous sommes dans un projet TriDyme
    if (!fs.existsSync('backend') || !fs.existsSync('frontend')) {
      console.error(
        chalk.red('Ce dossier ne semble pas être un projet TriDyme valide.'),
      );
      return;
    }

    // Demander la méthode de déploiement si non spécifiée
    let deployMethod = options.direct
      ? 'direct'
      : options.docker
      ? 'docker'
      : null;

    if (!deployMethod) {
      const methodChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'method',
          message: 'Comment souhaitez-vous déployer?',
          choices: [
            {
              name: 'Via Git (recommandé pour la plupart des utilisateurs)',
              value: 'git',
            },
            {
              name: 'Via Docker (recommandé pour des déploiements cohérents)',
              value: 'docker',
            },
            {
              name: 'Déploiement direct (nécessite une clé API Render)',
              value: 'direct',
            },
          ],
          default: 'git',
        },
      ]);

      deployMethod = methodChoice.method;
    }

    // Déploiement via Docker
    if (deployMethod === 'docker') {
      console.log(
        chalk.blue("Préparation du déploiement via Docker et l'API Render..."),
      );

      // Vérifier que Docker est installé
      if (!dockerDeploy.checkDockerInstalled()) {
        console.error(
          chalk.red("Docker n'est pas installé ou n'est pas accessible."),
        );
        console.log(
          chalk.yellow(
            'Veuillez installer Docker: https://docs.docker.com/get-docker/',
          ),
        );

        const { tryGit } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'tryGit',
            message: 'Voulez-vous essayer le déploiement via Git à la place?',
            default: true,
          },
        ]);

        if (tryGit) {
          deployMethod = 'git';
        } else {
          return;
        }
      } else {
        // Demander la clé API si elle n'a pas été fournie en option
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

        // Procéder au déploiement Docker via l'API Render
        await dockerDeploy.deployWithDocker({
          projectPath: process.cwd(),
          apiKey,
        });
        return;
      }
    }

    // Déploiement direct via l'API Render
    if (deployMethod === 'direct') {
      console.log(
        chalk.blue('Préparation du déploiement direct sur Render...'),
      );

      // Demander la clé API si elle n'a pas été fournie en option
      let apiKey = options.apiKey;
      let projectName = path.basename(process.cwd());
      let confirmDeploy = true;

      if (!apiKey) {
        // Utiliser le module de déploiement pour demander les informations
        const deployInfo = await renderDeploy.promptDeploymentInfo();

        if (!deployInfo.confirmDeploy) {
          console.log(chalk.yellow('Déploiement annulé.'));
          return;
        }

        apiKey = deployInfo.apiKey;
        projectName = deployInfo.projectName;
      }

      // Construire le projet pour la production
      console.log(chalk.blue('Construction du projet pour le déploiement...'));

      try {
        execSync('cd frontend && npm run build', { stdio: 'inherit' });
      } catch (error) {
        console.error(chalk.red('Échec de la construction du projet.'));
        console.error(chalk.red(`Erreur: ${error.message}`));
        return;
      }

      // Déployer l'application
      const deployResult = await renderDeploy.deployToRender({
        apiKey,
        projectName,
        projectPath: process.cwd(),
      });

      if (deployResult.success) {
        console.log(
          boxen(
            chalk.green.bold('✨ Déploiement réussi! ✨') +
              '\n\n' +
              `Votre application est maintenant disponible à l'adresse:\n` +
              `${chalk.cyan(deployResult.url)}`,
            { padding: 1, borderColor: 'green', margin: 1 },
          ),
        );
      } else if (deployResult.error && deployResult.error.includes('520')) {
        console.log(
          chalk.red(
            "Erreur 520 détectée: Problème de connexion avec l'API Render.",
          ),
        );
        console.log(
          chalk.yellow(
            'Cette erreur est généralement temporaire et liée à Cloudflare.',
          ),
        );

        const { tryAlternative } = await inquirer.prompt([
          {
            type: 'list',
            name: 'tryAlternative',
            message: 'Que souhaitez-vous faire?',
            choices: [
              { name: 'Essayer le déploiement via Git', value: 'git' },
              { name: 'Essayer le déploiement via Docker', value: 'docker' },
              { name: 'Annuler le déploiement', value: 'cancel' },
            ],
            default: 'git',
          },
        ]);

        if (tryAlternative === 'git') {
          deployMethod = 'git';
        } else if (tryAlternative === 'docker') {
          // Redémarrer le processus avec Docker
          await dockerDeploy.deployWithDocker({
            projectPath: process.cwd(),
          });
          return;
        } else {
          return;
        }
      }

      if (deployMethod !== 'git') {
        return;
      }
    }

    // Méthode de déploiement via Git
    // Vérifier si git est installé
    try {
      execSync('git --version', { stdio: 'pipe' });
    } catch (error) {
      console.error(
        chalk.red(
          "Git n'est pas installé. Veuillez l'installer pour continuer ou utiliser l'option de déploiement direct ou Docker.",
        ),
      );
      return;
    }

    // Vérifier si le dépôt git est initialisé
    const isGitRepo = fs.existsSync('.git');
    if (!isGitRepo) {
      const initGit = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'init',
          message:
            "Ce dossier n'est pas un dépôt Git. Voulez-vous l'initialiser?",
          default: true,
        },
      ]);

      if (initGit.init) {
        try {
          execSync('git init', { stdio: 'pipe' });
          console.log(chalk.green('Dépôt Git initialisé.'));
        } catch (error) {
          console.error(
            chalk.red(
              `Erreur lors de l'initialisation du dépôt: ${error.message}`,
            ),
          );
          return;
        }
      } else {
        console.log(
          chalk.yellow(
            'Déploiement annulé. Un dépôt Git est nécessaire pour ce type de déploiement.',
          ),
        );
        return;
      }
    }

    // Guide de déploiement
    console.log(
      boxen(
        chalk.bold('Guide de déploiement sur Render via Git') +
          '\n\n' +
          '1. Créez un dépôt sur GitHub ou GitLab.\n' +
          '2. Ajoutez votre code au dépôt:\n' +
          '   git add .\n' +
          '   git commit -m "Initial commit"\n' +
          '   git remote add origin <URL_DU_DEPOT>\n' +
          '   git push -u origin main\n\n' +
          '3. Créez un compte sur Render (https://render.com)\n' +
          '4. Créez un nouveau Web Service et connectez-le à votre dépôt\n' +
          '5. Configuration:\n' +
          '   - Build Command: `cd frontend && npm run build`\n' +
          '   - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`\n\n' +
          'Pour plus de détails, consultez la documentation dans README.md',
        { padding: 1, borderColor: 'blue', margin: 1 },
      ),
    );

    // Proposer d'ouvrir le site web de Render
    const openRender = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'open',
        message: 'Voulez-vous ouvrir le site web de Render?',
        default: true,
      },
    ]);

    if (openRender.open) {
      const open =
        os.platform() === 'win32'
          ? 'start'
          : os.platform() === 'darwin'
          ? 'open'
          : 'xdg-open';

      execSync(`${open} https://render.com`, { stdio: 'ignore' });
    }
  });

// Commande pour mettre à jour le SDK
program
  .command('update')
  .description('Mettre à jour le SDK TriDyme')
  .action(async () => {
    // Vérifier la politique d'exécution PowerShell sur Windows
    if (os.platform() === 'win32') {
      await checkPowerShellExecutionPolicy();
    }

    console.log(chalk.blue('Vérification des mises à jour du SDK...'));

    // Vérifier si nous sommes dans un projet TriDyme
    if (!fs.existsSync('backend') || !fs.existsSync('frontend')) {
      console.error(
        chalk.red('Ce dossier ne semble pas être un projet TriDyme valide.'),
      );
      return;
    }

    const { continue: confirmUpdate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message:
          'Cela peut écraser vos modifications. Avez-vous sauvegardé vos changements? Voulez-vous continuer?',
        default: false,
      },
    ]);

    if (!confirmUpdate) {
      console.log(chalk.yellow('Mise à jour annulée.'));
      return;
    }

    // Créer un dossier temporaire pour le nouveau SDK
    const tempDir = path.join(os.tmpdir(), 'tridyme-sdk-update-' + Date.now());
    fs.mkdirSync(tempDir, { recursive: true });

    const spinner = ora('Téléchargement du SDK le plus récent...').start();

    try {
      execSync('git clone https://github.com/tridyme/sdk-webapp-python.git .', {
        cwd: tempDir,
        stdio: 'pipe',
      });
      spinner.succeed('SDK téléchargé avec succès');
    } catch (error) {
      spinner.fail('Échec du téléchargement du SDK');
      console.error(chalk.red(`Erreur: ${error.message}`));
      fs.removeSync(tempDir);
      return;
    }

    // Sauvegarder les fichiers personnalisés
    spinner.text = 'Sauvegarde de vos fichiers personnalisés...';
    spinner.start();

    // Fichiers à sauvegarder
    const filesToSave = [
      '.env',
      'frontend/.env.development',
      'frontend/.env.production',
      'frontend/src/Views',
    ];

    const savedFiles = {};

    filesToSave.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        if (fs.statSync(filePath).isDirectory()) {
          savedFiles[filePath] = {};
          // Récursive copy of directory content
          const copyDirRecursively = (src, dest = {}) => {
            const files = fs.readdirSync(src);
            files.forEach((file) => {
              const srcPath = path.join(src, file);
              if (fs.statSync(srcPath).isDirectory()) {
                dest[file] = {};
                copyDirRecursively(srcPath, dest[file]);
              } else {
                dest[file] = fs.readFileSync(srcPath, 'utf8');
              }
            });
          };
          copyDirRecursively(filePath, savedFiles[filePath]);
        } else {
          savedFiles[filePath] = fs.readFileSync(filePath, 'utf8');
        }
      }
    });

    spinner.succeed('Fichiers personnalisés sauvegardés');

    // Copier le nouveau SDK en excluant .git
    spinner.text = 'Mise à jour du SDK...';
    spinner.start();

    try {
      fs.copySync(tempDir, '.', {
        filter: (src) => !src.includes('.git'),
        overwrite: true,
      });
      spinner.succeed('SDK mis à jour avec succès');
    } catch (error) {
      spinner.fail('Échec de la mise à jour du SDK');
      console.error(chalk.red(`Erreur: ${error.message}`));
      fs.removeSync(tempDir);
      return;
    }

    // Restaurer les fichiers personnalisés
    spinner.text = 'Restauration de vos fichiers personnalisés...';
    spinner.start();

    Object.entries(savedFiles).forEach(([filePath, content]) => {
      if (typeof content === 'string') {
        fs.writeFileSync(filePath, content);
      } else {
        // Recursively restore directory
        const restoreDirRecursively = (destPath, contentObj) => {
          if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
          }

          Object.entries(contentObj).forEach(([file, fileContent]) => {
            const fileDest = path.join(destPath, file);
            if (typeof fileContent === 'string') {
              fs.writeFileSync(fileDest, fileContent);
            } else {
              restoreDirRecursively(fileDest, fileContent);
            }
          });
        };
        restoreDirRecursively(filePath, content);
      }
    });

    spinner.succeed('Fichiers personnalisés restaurés');

    // Nettoyage
    fs.removeSync(tempDir);

    console.log(
      boxen(
        chalk.green.bold('✨ SDK mis à jour avec succès! ✨') +
          '\n\n' +
          'Vos fichiers personnalisés ont été préservés.\n' +
          'Vous devrez peut-être reconstruire le projet pour que les changements prennent effet.',
        { padding: 1, borderColor: 'green', margin: 1 },
      ),
    );
  });

program.parse(process.argv);

// Si aucune commande n'est spécifiée, afficher l'aide
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
