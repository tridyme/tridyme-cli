const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');

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
 * Vérifie l'état du dépôt Git
 * @param {string} projectPath - Chemin du projet
 * @returns {Object} - Informations sur l'état Git
 */
function checkGitStatus(projectPath) {
  try {
    // Vérifier si c'est un dépôt Git
    execSync('git rev-parse --git-dir', { 
      cwd: projectPath, 
      stdio: 'pipe' 
    });

    // Obtenir la branche actuelle
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: projectPath,
      encoding: 'utf8',
    }).trim();

    // Vérifier s'il y a des modifications non commitées
    const status = execSync('git status --porcelain', {
      cwd: projectPath,
      encoding: 'utf8',
    }).trim();

    // Vérifier si la branche a une remote
    let hasRemote = false;
    try {
      execSync(`git rev-parse --verify origin/${currentBranch}`, {
        cwd: projectPath,
        stdio: 'pipe',
      });
      hasRemote = true;
    } catch (error) {
      hasRemote = false;
    }

    return {
      isGitRepo: true,
      currentBranch,
      hasUncommittedChanges: status.length > 0,
      hasRemote,
      uncommittedFiles: status.split('\n').filter(line => line.trim()),
    };
  } catch (error) {
    return {
      isGitRepo: false,
      error: error.message,
    };
  }
}

/**
 * Configure les branches pour le déploiement automatique
 * @param {string} projectPath - Chemin du projet
 * @returns {Promise<Object>} - Configuration des branches
 */
async function configureBranches(projectPath) {
  const gitStatus = checkGitStatus(projectPath);

  if (!gitStatus.isGitRepo) {
    console.log(chalk.yellow('⚠️  Ce projet n\'est pas un dépôt Git.'));
    
    const { initGit } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'initGit',
        message: 'Voulez-vous initialiser un dépôt Git?',
        default: true,
      },
    ]);

    if (initGit) {
      execSync('git init', { cwd: projectPath, stdio: 'inherit' });
      execSync('git add .', { cwd: projectPath, stdio: 'inherit' });
      execSync('git commit -m "Initial commit"', { 
        cwd: projectPath, 
        stdio: 'inherit' 
      });
      console.log(chalk.green('✅ Dépôt Git initialisé'));
    } else {
      throw new Error('Un dépôt Git est requis pour le déploiement CI/CD');
    }
  }

  // Vérifier les modifications non commitées
  if (gitStatus.hasUncommittedChanges) {
    console.log(chalk.yellow('⚠️  Vous avez des modifications non commitées:'));
    gitStatus.uncommittedFiles.forEach(file => {
      console.log(chalk.yellow(`   ${file}`));
    });

    const { commitChanges } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'commitChanges',
        message: 'Voulez-vous commiter ces modifications?',
        default: true,
      },
    ]);

    if (commitChanges) {
      const { commitMessage } = await inquirer.prompt([
        {
          type: 'input',
          name: 'commitMessage',
          message: 'Message de commit:',
          default: 'Préparation pour déploiement CI/CD',
        },
      ]);

      execSync('git add .', { cwd: projectPath, stdio: 'inherit' });
      execSync(`git commit -m "${commitMessage}"`, { 
        cwd: projectPath, 
        stdio: 'inherit' 
      });
      console.log(chalk.green('✅ Modifications commitées'));
    }
  }

  return {
    currentBranch: gitStatus.currentBranch,
    hasRemote: gitStatus.hasRemote,
  };
}

/**
 * Configure la remote origin si nécessaire
 * @param {string} projectPath - Chemin du projet
 * @param {Object} branchConfig - Configuration des branches
 */
async function configureRemote(projectPath, branchConfig) {
  if (!branchConfig.hasRemote) {
    console.log(chalk.blue('🔗 Configuration de la remote origin...'));
    
    const { remoteUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'remoteUrl',
        message: 'URL du dépôt GitHub/GitLab (ex: https://github.com/user/repo.git):',
        validate: (input) => {
          if (!input.trim()) return 'L\'URL de la remote est requise';
          if (!input.includes('.git') && !input.includes('github.com') && !input.includes('gitlab.com')) {
            return 'Veuillez entrer une URL de dépôt Git valide';
          }
          return true;
        },
      },
    ]);

    try {
      execSync(`git remote add origin ${remoteUrl}`, { 
        cwd: projectPath, 
        stdio: 'pipe' 
      });
      console.log(chalk.green('✅ Remote origin configurée'));
    } catch (error) {
      // La remote existe peut-être déjà, essayer de la mettre à jour
      try {
        execSync(`git remote set-url origin ${remoteUrl}`, { 
          cwd: projectPath, 
          stdio: 'pipe' 
        });
        console.log(chalk.green('✅ Remote origin mise à jour'));
      } catch (updateError) {
        throw new Error(`Erreur lors de la configuration de la remote: ${updateError.message}`);
      }
    }
  }
}

/**
 * Déploie selon l'environnement en poussant sur la branche appropriée
 * @param {string} projectPath - Chemin du projet
 * @param {string} environment - Environnement (development/production)
 * @param {string} currentBranch - Branche actuelle
 */
async function deployToBranch(projectPath, environment, currentBranch) {
  const targetBranch = environment === 'production' ? 'main' : 'develop';
  
  console.log(chalk.blue(`🚀 Déploiement ${environment} via branche ${targetBranch}...`));

  const spinner = ora('Préparation du déploiement...').start();

  try {
    // Si on n'est pas sur la bonne branche, créer/basculer vers elle
    if (currentBranch !== targetBranch) {
      spinner.text = `Création/bascule vers la branche ${targetBranch}...`;
      
      try {
        // Essayer de basculer vers la branche existante
        execSync(`git checkout ${targetBranch}`, { 
          cwd: projectPath, 
          stdio: 'pipe' 
        });
      } catch (error) {
        // La branche n'existe pas, la créer
        execSync(`git checkout -b ${targetBranch}`, { 
          cwd: projectPath, 
          stdio: 'pipe' 
        });
      }

      // Merger les changements de la branche précédente si nécessaire
      if (currentBranch !== 'HEAD') {
        try {
          execSync(`git merge ${currentBranch}`, { 
            cwd: projectPath, 
            stdio: 'pipe' 
          });
        } catch (mergeError) {
          spinner.warn('Conflit de merge détecté. Résolvez manuellement les conflits.');
          throw new Error('Conflit de merge - résolvez manuellement et réessayez');
        }
      }
    }

    // Construire le frontend pour la production
    if (environment === 'production') {
      spinner.text = 'Construction du frontend pour la production...';
      execSync('npm run build', {
        cwd: path.join(projectPath, 'frontend'),
        stdio: 'pipe',
      });
      
      // Commiter les fichiers de build si nécessaire
      try {
        execSync('git add frontend/build', { cwd: projectPath, stdio: 'pipe' });
        execSync('git commit -m "Build production frontend"', { 
          cwd: projectPath, 
          stdio: 'pipe' 
        });
      } catch (error) {
        // Pas de nouveaux fichiers de build à commiter
      }
    }

    // Pousser vers la remote
    spinner.text = `Push vers origin/${targetBranch}...`;
    execSync(`git push -u origin ${targetBranch}`, { 
      cwd: projectPath, 
      stdio: 'pipe' 
    });

    spinner.succeed(`Déploiement ${environment} initié avec succès`);

    // Afficher les informations de déploiement
    const projectName = path.basename(projectPath);
    const deploymentUrl = environment === 'production' 
      ? `https://${projectName}.tridyme.com`
      : `https://${projectName}-dev.tridyme.com`;

    console.log(
      boxen(
        chalk.green.bold('🎉 Déploiement CI/CD initié! 🎉') +
          '\n\n' +
          `${chalk.cyan('🌍 Environnement:')} ${environment}\n` +
          `${chalk.cyan('🌿 Branche:')} ${targetBranch}\n` +
          `${chalk.cyan('🔗 URL prévue:')} ${deploymentUrl}\n\n` +
          `${chalk.yellow('ℹ️  Le déploiement sera automatiquement traité par le pipeline CI/CD.')}\n` +
          `${chalk.yellow('   Surveillez l\'état sur votre plateforme Git (GitHub/GitLab).')}`,
        {
          padding: 1,
          borderColor: 'green',
          margin: 1,
        },
      ),
    );

    return {
      success: true,
      environment,
      branch: targetBranch,
      url: deploymentUrl,
    };

  } catch (error) {
    spinner.fail(`Échec du déploiement: ${error.message}`);
    throw error;
  }
}

/**
 * Fonction principale pour initier un déploiement CI/CD
 * @param {Object} options - Options de déploiement
 */
async function initiateCICDDeploy(options = {}) {
  const projectPath = options.projectPath || process.cwd();

  console.log(
    chalk.blue('🔄 Déploiement CI/CD via Git\n'),
  );

  try {
    // Vérifier que le projet est valide
    if (!validateProject(projectPath)) {
      return {
        success: false,
        error: 'Structure de projet TriDyme invalide',
      };
    }

    // Déterminer l'environnement
    let environment = options.environment;
    if (!environment) {
      const envChoice = await inquirer.prompt([
        {
          type: 'list',
          name: 'environment',
          message: 'Environnement de déploiement:',
          choices: [
            {
              name: '🧪 Développement (branche develop → dev.tridyme.com)',
              value: 'development',
            },
            {
              name: '🚀 Production (branche main → tridyme.com)',
              value: 'production',
            },
          ],
          default: 'development',
        },
      ]);
      environment = envChoice.environment;
    }

    // Configurer Git et les branches
    const branchConfig = await configureBranches(projectPath);
    
    // Configurer la remote si nécessaire
    await configureRemote(projectPath, branchConfig);

    // Demander confirmation
    const targetBranch = environment === 'production' ? 'main' : 'develop';
    const { confirmDeploy } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmDeploy',
        message: `Déployer en ${environment} (push vers ${targetBranch})?`,
        default: true,
      },
    ]);

    if (!confirmDeploy) {
      console.log(chalk.yellow('Déploiement annulé.'));
      return { success: false, cancelled: true };
    }

    // Effectuer le déploiement
    const result = await deployToBranch(
      projectPath, 
      environment, 
      branchConfig.currentBranch
    );

    return result;

  } catch (error) {
    console.error(
      chalk.red(`❌ Erreur lors du déploiement: ${error.message}`),
    );

    // Conseils en cas d'erreur
    console.log(chalk.yellow('\n💡 Conseils de dépannage:'));
    console.log(chalk.white('• Vérifiez que vous avez les droits de push sur le dépôt'));
    console.log(chalk.white('• Assurez-vous que la remote origin est correctement configurée'));
    console.log(chalk.white('• Résolvez les conflits de merge si nécessaire'));

    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  initiateCICDDeploy,
  validateProject,
  checkGitStatus,
};