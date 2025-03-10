# TridymeSDK CLI

Un outil en ligne de commande simplifié pour faciliter le développement et le déploiement d'applications basées sur TridymeSDK.

## Présentation

TridymeSDK CLI est conçu pour les ingénieurs en calcul de structure qui souhaitent créer leurs propres applications de simulation sans avoir à maîtriser les complexités des outils de développement modernes. Il simplifie les étapes clés du cycle de vie d'une application :

- **Initialisation** : Création rapide d'un nouveau projet à partir du SDK
- **Développement** : Lancement de l'environnement de développement en quelques commandes
- **Construction** : Préparation de l'application pour le déploiement
- **Déploiement** : Publication de l'application sur Google Cloud GKE

## Installation

### Linux/macOS

```bash
curl -s https://raw.githubusercontent.com/tridyme/tridyme-cli/main/install-tridyme-cli.sh | bash
```

### Windows (PowerShell)

```powershell
iwr -useb https://raw.githubusercontent.com/tridyme/tridyme-cli/main/install-tridyme-cli.ps1 | iex
```

## Utilisation

### Initialiser un nouveau projet

```bash
tridyme-cli init mon-application
```

Options :
- `--method [git|zip]` : Méthode de téléchargement (git par défaut)
- `--customize` : Personnaliser automatiquement le projet

### Lancer le mode développement

```bash
cd mon-application
tridyme-cli dev
```

### Construire pour la production

```bash
tridyme-cli build
```

Options :
- `--docker` : Construire aussi l'image Docker
- `--tag NOM:VERSION` : Tag pour l'image Docker

### Déployer sur Google Cloud GKE

```bash
tridyme-cli deploy
```

### Configurer les paramètres

```bash
tridyme-cli configure
```

Options :
- `--project-name NOM` : Nom du projet
- `--gcp-project ID` : ID du projet GCP
- `--gcp-region REGION` : Région GCP
- `--gcp-cluster NOM` : Nom du cluster GKE
- `--gcp-repository NOM` : Nom du dépôt Artifact Registry

## Structure d'un projet TridymeSDK

Un projet créé avec TridymeSDK CLI contient les répertoires suivants :

- `backend/` : Le serveur Python basé sur FastAPI
- `frontend/` : L'interface utilisateur React
- `.env` : Les variables d'environnement
- `Dockerfile` : La configuration pour créer une image Docker
- `.tridyme-config.json` : Configuration spécifique à votre projet

## Prérequis

- Python 3.6+
- Node.js 14+
- npm 6+
- Pour le déploiement : Docker, Google Cloud SDK, kubectl

## Utilisation avec Google Cloud

Pour déployer sur Google Cloud GKE, vous devez :

1. Avoir un compte Google Cloud avec un projet actif
2. Avoir créé un cluster GKE
3. Avoir configuré un dépôt Artifact Registry pour stocker vos images Docker
4. Avoir installé et configuré `gcloud` et `kubectl`

La commande `tridyme-cli deploy` vous guidera à travers le processus et stockera vos préférences.

## Développement personnalisé

Si vous souhaitez personnaliser davantage votre application, consultez la documentation complète de TridymeSDK sur [tridyme.com](https://www.tridyme.com/).
