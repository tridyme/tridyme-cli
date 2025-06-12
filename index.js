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

// Module de déploiement simplifié
const deployModule = require('./deploy');

// URL du SDK (dépôt GitLab privé)
const SDK_REPO_URL = 'https://gitlab.com/socotec-blq/sdk-webapp-python.git';

// Fonction pour gérer l'authentification GitLab
async function handleGitLabAuth() {
  console.log(chalk.blue('\n🔐 Authentification GitLab requise\n'));
  console.log(chalk.yellow('Le SDK TriDyme est hébergé sur un GitLab privé.'));
  console.log(chalk.yellow('Vous devez avoir accès au dépôt pour continuer.\n'));

  const authMethods = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'Comment souhaitez-vous vous authentifier?',
      choices: [
        {
          name: '🔑 Token d\'accès personnel GitLab',
          value: 'token',
        },
        {
          name: '👤 Nom d\'utilisateur et mot de passe',
          value: 'credentials',
        },
        {
          name: '🔧 J\'ai déjà configuré Git avec mes credentials',
          value: 'existing',
        },
      ],
    },
  ]);

  let authUrl = SDK_REPO_URL;

  if (authMethods.method === 'token') {
    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Entrez votre token d\'accès GitLab:',
        validate: (input) => input.trim() ? true : 'Le token est requis',
      },
    ]);
    
    // Format: https://oauth2:TOKEN@gitlab.com/path
    authUrl = SDK_REPO_URL.replace('https://', `https://oauth2:${token}@`);
    
  } else if (authMethods.method === 'credentials') {
    const credentials = await inquirer.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'Nom d\'utilisateur GitLab:',
        validate: (input) => input.trim() ? true : 'Le nom d\'utilisateur est requis',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Mot de passe GitLab:',
        validate: (input) => input.trim() ? true : 'Le mot de passe est requis',
      },
    ]);
    
    // Format: https://username:password@gitlab.com/path
    authUrl = SDK_REPO_URL.replace('https://', `https://${credentials.username}:${credentials.password}@`);
    
  } else if (authMethods.method === 'existing') {
    console.log(chalk.green('✅ Utilisation de la configuration Git existante'));
    authUrl = SDK_REPO_URL;
  }

  return authUrl;
}

// Fonction pour tester l'accès au dépôt GitLab
async function testGitLabAccess(authUrl, projectPath) {
  const spinner = ora('Test d\'accès au dépôt GitLab...').start();
  
  try {
    // Tester l'accès avec ls-remote (plus léger qu'un clone)
    execSync(`git ls-remote ${authUrl}`, { 
      cwd: projectPath, 
      stdio: 'pipe',
      timeout: 10000, // 10 secondes timeout
    });
    
    spinner.succeed('Accès au dépôt GitLab confirmé');
    return true;
  } catch (error) {
    spinner.fail('Échec de l\'accès au dépôt GitLab');
    
    console.error(chalk.red('❌ Impossible d\'accéder au dépôt GitLab'));
    console.log(chalk.yellow('\\nCauses possibles:'));
    console.log(chalk.white('• Credentials incorrects'));
    console.log(chalk.white('• Pas d\'accès au dépôt privé'));
    console.log(chalk.white('• Problème de connexion réseau'));
    console.log(chalk.white('• Token expiré ou révoqué'));
    
    console.log(chalk.blue('\\n💡 Pour obtenir un token d\'accès:'));
    console.log(chalk.white('1. Connectez-vous à GitLab'));
    console.log(chalk.white('2. Allez dans Préférences > Tokens d\'accès'));
    console.log(chalk.white('3. Créez un token avec les permissions \"read_repository\"'));
    
    return false;
  }
}

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

      // Gérer l'authentification GitLab
      let authUrl;
      let accessGranted = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!accessGranted && retryCount < maxRetries) {
        try {
          authUrl = await handleGitLabAuth();
          accessGranted = await testGitLabAccess(authUrl, projectPath);
          
          if (!accessGranted) {
            retryCount++;
            if (retryCount < maxRetries) {
              const { retry } = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'retry',
                  message: 'Voulez-vous réessayer avec d\'autres credentials?',
                  default: true,
                },
              ]);
              
              if (!retry) break;
            }
          }
        } catch (error) {
          console.error(chalk.red(`Erreur d'authentification: ${error.message}`));
          break;
        }
      }

      if (!accessGranted) {
        console.error(chalk.red('❌ Impossible d\'accéder au SDK TriDyme'));
        console.log(chalk.yellow('Contactez votre administrateur pour obtenir l\'accès au dépôt GitLab.'));
        return;
      }

      // Clone le référentiel avec authentification
      const spinner = ora('Clonage du SDK TriDyme...').start();
      try {
        execSync(
          `git clone ${authUrl} .`,
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
REACT_APP_LOGO="./logo.svg"
REACT_APP_COMPANY="${answers.companyName}"
REACT_APP_APPLICATION_NAME="${answers.applicationName}"
REACT_APP_APPLICATION_API_URL="http://localhost:8000"
REACT_APP_PLATFORM_API_URL="${answers.platformApiUrl}"
REACT_APP_PLATFORM_API_TOKEN="${platformApiToken}"
REACT_APP_APPLICATION_ID="${applicationId}"
NODE_PATH=./..
CI=false`;

      const envProdContent = `ENVIRONMENT="production"
REACT_APP_LOGO="./logo.svg"
REACT_APP_COMPANY="${answers.companyName}"
REACT_APP_APPLICATION_NAME="${answers.applicationName}"
REACT_APP_APPLICATION_API_URL="${renderUrl}"
REACT_APP_PLATFORM_API_URL="${answers.platformApiUrl}"
REACT_APP_PLATFORM_API_TOKEN="${platformApiToken}"
REACT_APP_APPLICATION_ID="${applicationId}"
NODE_PATH=./..
CI=false`;

      const envContent = `ENVIRONMENT="development"
REACT_APP_LOGO="./logo.svg"
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
        execSync(`${pythonCmd} -m venv env`, {
          cwd: path.join(projectPath, 'backend'),
          stdio: 'pipe',
          shell: os.platform() === 'win32' ? true : '/bin/bash',
        });
        spinner.succeed('Environnement Python créé');

        // Installer les dépendances Python
        spinner.text = 'Installation des dépendances Python...';
        spinner.start();

        if (os.platform() === 'win32') {
          execSync(
            `.\\env\\Scripts\\python.exe -m pip install --upgrade pip`,
            {
              cwd: path.join(projectPath, 'backend'),
              stdio: 'pipe',
              shell: true,
            },
          );

          execSync(
            `.\\env\\Scripts\\pip.exe install -r requirements.txt`,
            {
              cwd: path.join(projectPath, 'backend'),
              stdio: 'pipe',
              shell: true,
            },
          );
        } else {
          // Approche Unix/macOS - utiliser directement les exécutables de l'environnement virtuel
          const pythonPath = path.join(projectPath, 'backend', 'env', 'bin', 'python');
          const pipPath = path.join(projectPath, 'backend', 'env', 'bin', 'pip');
          
          execSync(`${pythonPath} -m pip install --upgrade pip`, {
            cwd: path.join(projectPath, 'backend'),
            stdio: 'pipe',
            shell: '/bin/bash',
          });

          execSync(`${pipPath} install -r requirements.txt`, {
            cwd: path.join(projectPath, 'backend'),
            stdio: 'pipe',
            shell: '/bin/bash',
          });
        }

        spinner.succeed('Dépendances Python installées');

        // Installer les dépendances frontend
        spinner.text = 'Installation des dépendances frontend...';
        spinner.start();

        execSync('npm install', {
          cwd: path.join(projectPath, 'frontend'),
          stdio: 'pipe',
          shell: os.platform() === 'win32' ? true : '/bin/bash',
        });

        execSync('npm install', {
          cwd: path.join(projectPath, 'frontend', 'module-federation'),
          stdio: 'pipe',
          shell: os.platform() === 'win32' ? true : '/bin/bash',
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
            shell: os.platform() === 'win32' ? true : '/bin/bash',
          });
          spinner.succeed('Environnement virtuel Python créé');
        } catch (error) {
          spinner.fail(
            "Échec de la création de l'environnement virtuel Python",
          );
          console.error(chalk.red(`Erreur: ${error.message}`));
          
          // Diagnostics plus détaillés
          console.log(chalk.yellow('\n🔍 Diagnostic:'));
          
          // Vérifier si Python est disponible
          try {
            const pythonVersion = execSync(os.platform() === 'win32' ? 'python --version' : 'python3 --version', {
              stdio: 'pipe',
              encoding: 'utf8',
            });
            console.log(chalk.green(`✅ Python trouvé: ${pythonVersion.trim()}`));
          } catch (pythonError) {
            console.log(chalk.red('❌ Python non trouvé dans le PATH'));
            console.log(chalk.yellow('💡 Installez Python depuis https://python.org'));
            return;
          }
          
          // Vérifier les permissions
          const backendPath = path.join(process.cwd(), 'backend');
          if (!fs.existsSync(backendPath)) {
            console.log(chalk.red('❌ Dossier backend non trouvé'));
            console.log(chalk.yellow('💡 Assurez-vous d\'être dans un projet TriDyme valide'));
            return;
          }
          
          console.log(chalk.yellow('💡 Essayez de créer l\'environnement manuellement:'));
          const manualCmd = os.platform() === 'win32' 
            ? 'cd backend && python -m venv env'
            : 'cd backend && python3 -m venv env';
          console.log(chalk.white(`   ${manualCmd}`));
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
          // Approche Unix/macOS - utiliser directement l'exécutable Python de l'environnement virtuel
          const pythonPath = path.join(process.cwd(), 'backend', 'env', 'bin', 'python');
          const pipPath = path.join(process.cwd(), 'backend', 'env', 'bin', 'pip');
          
          // Mise à jour de pip
          execSync(`${pythonPath} -m pip install --upgrade pip`, {
            cwd: path.join(process.cwd(), 'backend'),
            stdio: 'pipe',
            shell: '/bin/bash',
          });
          
          // Installation des dépendances
          execSync(`${pipPath} install -r requirements.txt`, {
            cwd: path.join(process.cwd(), 'backend'),
            stdio: 'pipe',
            shell: '/bin/bash',
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
      const pythonExe = path.join(process.cwd(), 'backend', 'env', 'Scripts', 'python.exe');
      backendProcess = spawn(pythonExe, ['main.py'], {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
      });
    } else {
      // Approche Unix/macOS - utiliser directement l'exécutable Python de l'environnement virtuel
      const pythonExe = path.join(process.cwd(), 'backend', 'env', 'bin', 'python');
      backendProcess = spawn(pythonExe, ['main.py'], {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
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
      execSync('npm run build', { 
        cwd: path.join(process.cwd(), 'frontend'),
        stdio: 'inherit',
        shell: os.platform() === 'win32' ? true : '/bin/bash',
      });
      console.log(chalk.green('✅ Projet construit avec succès!'));
    } catch (error) {
      console.error(
        chalk.red(`Erreur lors de la construction: ${error.message}`),
      );
    }
  });

// Commande pour déployer l'application
program
  .command('deploy')
  .description("Déployer l'application via CI/CD")
  .option(
    '--env <environment>',
    'Environnement (development|production)',
    'development',
  )
  .action(async (options) => {
    await deployModule.initiateCICDDeploy({
      projectPath: process.cwd(),
      environment: options.env,
    });
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

    // Gérer l'authentification GitLab pour la mise à jour
    let authUrl;
    let accessGranted = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!accessGranted && retryCount < maxRetries) {
      try {
        authUrl = await handleGitLabAuth();
        accessGranted = await testGitLabAccess(authUrl, tempDir);
        
        if (!accessGranted) {
          retryCount++;
          if (retryCount < maxRetries) {
            const { retry } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'retry',
                message: 'Voulez-vous réessayer avec d\'autres credentials?',
                default: true,
              },
            ]);
            
            if (!retry) break;
          }
        }
      } catch (error) {
        console.error(chalk.red(`Erreur d'authentification: ${error.message}`));
        break;
      }
    }

    if (!accessGranted) {
      console.error(chalk.red('❌ Impossible d\'accéder au SDK TriDyme'));
      console.log(chalk.yellow('Contactez votre administrateur pour obtenir l\'accès au dépôt GitLab.'));
      fs.removeSync(tempDir);
      return;
    }

    const spinner = ora('Téléchargement du SDK le plus récent...').start();

    try {
      execSync(`git clone ${authUrl} .`, {
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
