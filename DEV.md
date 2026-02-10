# Guide developpeur - TriDyme CLI

## Prerequis

- Node.js >= 16
- npm >= 8
- Git

## Installation

```bash
git clone https://github.com/tridyme/tridyme-cli.git
cd tridyme-cli
npm install
npm link   # Rend la commande `tridyme` disponible globalement
tridyme --version
```

## Structure du projet

```
tridyme-cli/
├── index.js         # Point d'entree du CLI (commandes, creation de projet)
├── deploy.js        # Module de deploiement Git CI/CD
├── auth.js          # Module d'authentification CLI (login/token)
├── cloud-deploy.js  # Module de deploiement cloud (packaging, upload, polling)
├── package.json
├── readme.md        # Documentation utilisateur
├── DEV.md           # Documentation developpeur (ce fichier)
└── DEPLOY.md        # Guide de deploiement
```

## SDK TriDyme

Le SDK est heberge sur GitHub (public) : https://github.com/tridyme/sdk-webapp-python

Lors de `tridyme create`, le CLI clone ce depot et configure les fichiers d'environnement.

## Tester les commandes

```bash
# Creation de projet
tridyme create test-project

# Developpement
cd test-project
tridyme dev

# Build
tridyme build

# Deploiement cloud (necessite tridyme login)
tridyme login
tridyme deploy

# Deploiement Git CI/CD
tridyme deploy --git --env development

# Mise a jour du SDK
tridyme update
```

## Depannage

### Probleme de connexion au SDK

```bash
# Verifier l'acces au depot GitHub
git ls-remote https://github.com/tridyme/sdk-webapp-python.git
```

### Probleme d'environnement Python

```bash
cd test-project/backend
python3 -m venv env
source env/bin/activate   # Windows: .\env\Scripts\activate
pip install -r requirements.txt
```

### Conflits de merge (deploiement Git)

```bash
git status
# Resoudre les conflits manuellement
git add .
git commit -m "Resolution des conflits"
tridyme deploy
```

## Publier une nouvelle version

```bash
npm version [patch|minor|major]
npm publish
```

## Licence

MIT
