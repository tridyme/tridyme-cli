# TriDyme CLI

Un outil en ligne de commande pour simplifier le développement et le déploiement d'applications TriDyme pour les ingénieurs en structure.

> **Note importante** : Le SDK TriDyme est hébergé sur un GitLab privé. Vous devez avoir un accès autorisé pour utiliser cet outil.

## 🚀 Installation

```bash
# Installation globale
npm install -g tridyme-cli

# Vérifier l'installation
tridyme --version
```

## 🔐 Authentification GitLab

Le SDK TriDyme est hébergé sur un GitLab privé (`gitlab.com/socotec-blq/sdk-webapp-python`). Vous devez disposer d'un accès autorisé.

### Méthodes d'authentification supportées :

1. **Token d'accès personnel GitLab** (recommandé)
   - Créez un token dans GitLab : Préférences > Tokens d'accès
   - Permissions requises : `read_repository`

2. **Nom d'utilisateur et mot de passe**
   - Vos identifiants GitLab standards

3. **Configuration Git existante**
   - Si vous avez déjà configuré Git avec vos credentials GitLab

## 📋 Commandes

### Créer un nouveau projet

```bash
# Crée un nouveau projet interactivement
tridyme create

# Crée un nouveau projet avec un nom spécifique
tridyme create mon-projet-calcul
```

La commande interactive vous demandera :

- Le nom de l'application
- Le nom de votre entreprise

Un ID unique d'application sera automatiquement généré et les fichiers de configuration nécessaires seront créés avec les paramètres appropriés.

### Démarrer le mode développement

```bash
# Dans le dossier de votre projet
tridyme dev
```

Cette commande lance :

1. Le serveur backend Python avec FastAPI
2. L'application frontend React

### Construire pour la production

```bash
# Dans le dossier de votre projet
tridyme build
```

### Déployer l'application

```bash
# Déploiement CI/CD automatique
tridyme deploy

# Déployer en développement (branche develop)
tridyme deploy --env development

# Déployer en production (branche main)
tridyme deploy --env production
```

Le déploiement utilise maintenant un système CI/CD automatique basé sur Git :

- **Développement** : Push sur la branche `develop` → Déploiement automatique sur `*-dev.tridyme.com`
- **Production** : Push sur la branche `main` → Déploiement automatique sur `*.tridyme.com`

### Mettre à jour le SDK

```bash
# Dans le dossier de votre projet
tridyme update
```

## 🌐 Structure du projet

Après avoir créé un projet, vous aurez la structure suivante :

```
mon-projet-calcul/
├── .env                 # Variables d'environnement globales
├── backend/             # Serveur Python FastAPI
│   ├── main.py          # Point d'entrée du backend
│   └── requirements.txt # Dépendances Python
├── frontend/            # Application React
│   ├── src/             # Code source React
│   ├── public/          # Fichiers statiques
│   └── package.json     # Dépendances JavaScript
├── init.ps1             # Script d'initialisation Windows
└── init.sh              # Script d'initialisation Linux/MacOS
```

## 🔧 Personnalisation

Pour personnaliser votre application, vous pouvez modifier les fichiers suivants :

- `.env` - Variables d'environnement globales
- `frontend/.env.development` - Variables d'environnement pour le développement
- `frontend/.env.production` - Variables d'environnement pour la production
- `frontend/src/Views/` - Composants React pour vos vues

## 📦 Déploiement CI/CD

Le déploiement est maintenant entièrement automatisé via un système CI/CD basé sur Git. Plus besoin de configuration manuelle !

### Fonctionnement

1. **Développement local** : Travaillez sur votre projet normalement
2. **Commit et push** : Commitez vos changements
3. **Déploiement automatique** : Le CLI pousse sur la bonne branche pour déclencher le déploiement

### Branches de déploiement

- **`develop`** → Environnement de développement (`*-dev.tridyme.com`)
- **`main`** → Environnement de production (`*.tridyme.com`)

### Configuration automatique

Le CLI gère automatiquement :
- ✅ Initialisation du dépôt Git si nécessaire
- ✅ Création des branches de déploiement
- ✅ Configuration des remotes
- ✅ Build du frontend pour la production
- ✅ Push vers la bonne branche selon l'environnement

## 📝 Notes pour les utilisateurs Windows

Si vous rencontrez des problèmes lors de l'initialisation ou de l'exécution sur Windows:

1. **Politique d'exécution PowerShell**: Vous pourriez avoir besoin de modifier la politique d'exécution PowerShell:

   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
   ```

2. **Python dans le PATH**: Assurez-vous que Python est accessible via la commande `python` (sans version).

3. **Initialisation manuelle**: Si l'initialisation automatique échoue:

   ```powershell
   cd mon-projet
   cd backend
   python -m venv env
   .\env\Scripts\python.exe -m pip install --upgrade pip
   .\env\Scripts\pip.exe install -r requirements.txt
   cd ..\frontend
   npm install
   cd module-federation
   npm install
   ```

4. **Problèmes d'activation de l'environnement virtuel**:
   L'outil a été mis à jour pour éviter les problèmes d'activation sur Windows, mais si vous rencontrez toujours des difficultés, utilisez directement les exécutables dans le dossier `Scripts` de l'environnement virtuel comme indiqué ci-dessus.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT.
