# Guide d'installation pour les développeurs

Ce guide vous aidera à installer et configurer l'outil CLI TriDyme pour le développement.

## Prérequis

- Node.js (v16 ou supérieur)
- npm (v8 ou supérieur)
- Git
- **Accès au GitLab privé** : `gitlab.com/socotec-blq/sdk-webapp-python`

## Étapes d'installation

1. **Clonez le dépôt**

```bash
git clone https://github.com/tridyme/tridyme-cli.git
cd tridyme-cli
```

> **Important** : Le SDK TriDyme est hébergé sur un GitLab privé (Socotec). Vous devez disposer d'un compte GitLab avec accès au dépôt pour utiliser le CLI.

2. **Installez les dépendances**

```bash
npm install
```

3. **Liez le CLI pour le développement**

Cette étape permet d'utiliser la commande `tridyme` en local pendant le développement.

```bash
npm link
```

4. **Testez l'installation**

```bash
tridyme --version
```

## Structure du projet

```
tridyme-cli/
├── index.js           # Point d'entrée du CLI avec authentification GitLab
├── deploy.js          # Module de déploiement CI/CD simplifié
├── package.json       # Configuration du package
├── README.md          # Documentation utilisateur
└── DEV.md             # Documentation développeur
```

## Authentification GitLab

Le CLI gère automatiquement l'authentification au GitLab privé. Trois méthodes sont supportées :

### 1. Token d'accès personnel (recommandé)

1. Connectez-vous à GitLab
2. Allez dans **Préférences** > **Tokens d'accès**
3. Créez un token avec les permissions `read_repository`
4. Utilisez ce token lors de l'exécution du CLI

### 2. Nom d'utilisateur et mot de passe

Utilisez vos identifiants GitLab standards.

### 3. Configuration Git existante

Si vous avez déjà configuré Git avec vos credentials GitLab :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@socotec.com"
# Configuration des credentials via git credential manager
```

## Système de déploiement CI/CD

Le CLI utilise un système de déploiement CI/CD simplifié basé sur Git :

### Fonctionnement

1. **Branche `develop`** → Environnement de développement (`*-dev.tridyme.com`)
2. **Branche `main`** → Environnement de production (`*.tridyme.com`)

### Commandes de déploiement

```bash
# Déploiement en développement
tridyme deploy --env development

# Déploiement en production
tridyme deploy --env production

# Déploiement interactif (choisir l'environnement)
tridyme deploy
```

### Ce que fait le CLI automatiquement

- ✅ Vérifie la structure du projet TriDyme
- ✅ Initialise Git si nécessaire
- ✅ Gestion des modifications non commitées
- ✅ Création/bascule vers la bonne branche
- ✅ Merge des changements si nécessaire
- ✅ Build du frontend pour la production
- ✅ Push vers la remote origin
- ✅ Configuration de la remote si absente

## Publier une nouvelle version du CLI

1. Mettez à jour la version dans `package.json`
2. Créez les notes de version
3. Publiez sur npm

```bash
npm version [patch|minor|major]
npm publish
```

## Tester les commandes pendant le développement

### Création d'un projet (avec authentification GitLab)

```bash
# Le CLI demandera l'authentification GitLab automatiquement
tridyme create test-project

# Authentification interactive :
# 🔐 Authentification GitLab requise
# ? Comment souhaitez-vous vous authentifier?
#   🔑 Token d'accès personnel GitLab
#   👤 Nom d'utilisateur et mot de passe
# ❯ 🔧 J'ai déjà configuré Git avec mes credentials
```

### Test des commandes

```bash
# Démarrer le mode développement
cd test-project
tridyme dev

# Construire le projet
tridyme build

# Tester le déploiement CI/CD
tridyme deploy --env development

# Mettre à jour le SDK (avec authentification)
tridyme update
```

## Débogage et résolution de problèmes

### Verbosité accrue

```bash
NODE_DEBUG=tridyme tridyme [command]
```

### Problèmes d'authentification GitLab

**Erreur d'accès au dépôt :**

```bash
❌ Impossible d'accéder au dépôt GitLab

Causes possibles:
• Credentials incorrects
• Pas d'accès au dépôt privé
• Problème de connexion réseau
• Token expiré ou révoqué
```

**Solutions :**

1. **Vérifiez votre token** : Assurez-vous qu'il est valide et a les permissions `read_repository`
2. **Testez l'accès manuel** :
   ```bash
   git ls-remote https://gitlab.com/socotec-blq/sdk-webapp-python.git
   ```
3. **Vérifiez votre accès au projet** sur GitLab

### Problèmes avec l'environnement Python

**Erreur `spawnSync /bin/sh ENOENT` :**

```bash
⚠ Environnement virtuel Python non trouvé
✖ Échec de la création de l'environnement virtuel Python
Erreur: spawnSync /bin/sh ENOENT
```

**Solutions :**

1. **Vérifiez Python** :
   ```bash
   # Sur macOS/Linux
   python3 --version
   which python3
   
   # Sur Windows
   python --version
   where python
   ```

2. **Création manuelle de l'environnement** :
   ```bash
   cd test-project/backend
   
   # Sur macOS/Linux
   python3 -m venv env
   source env/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   
   # Sur Windows
   python -m venv env
   .\env\Scripts\activate
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. **Permissions et PATH** :
   - Assurez-vous que Python est dans votre PATH
   - Vérifiez les permissions d'écriture dans le dossier du projet

### Problèmes de déploiement

**Conflits de merge :**

```bash
⚠️ Conflit de merge détecté. Résolvez manuellement les conflits.
```

**Solution :**

```bash
# Résoudre les conflits manuellement
git status
git add .
git commit -m "Résolution des conflits"

# Puis relancer le déploiement
tridyme deploy
```

## Tests et qualité du code

### Exécuter les tests

```bash
# Exécuter tous les tests
npm test

# Tests en mode watch
npm run test:watch
```

### Lint et formatage

```bash
# Vérifier le code
npm run lint

# Corriger automatiquement
npm run lint:fix

# Formater le code
npm run format
```

## Contribution

1. **Créez une branche** pour votre fonctionnalité
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```

2. **Faites vos modifications** en respectant les conventions

3. **Exécutez les tests et le lint**
   ```bash
   npm run lint && npm test
   ```

4. **Commitez vos changements**
   ```bash
   git add .
   git commit -m "feat: ajouter nouvelle fonctionnalité"
   ```

5. **Soumettez une pull request** sur GitHub

## Notes importantes

### Sécurité

- ⚠️ **Ne jamais commiter de tokens** ou credentials dans le code
- 🔒 Les credentials GitLab sont utilisés temporairement et ne sont pas stockés
- 🚫 Le CLI refuse l'exécution si l'accès au SDK n'est pas autorisé

### Environnements

- **Développement** : Tests et validation avant production
- **Production** : Environnement live accessible aux utilisateurs finaux

### Support

- 📞 Contactez l'équipe DevOps pour les problèmes d'accès GitLab
- 📝 Consultez les logs de déploiement sur la plateforme CI/CD
- 🐛 Reportez les bugs sur le dépôt GitHub du CLI

## Licence

MIT
