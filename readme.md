# TriDyme CLI

Un outil en ligne de commande pour simplifier le développement et le déploiement d'applications TriDyme pour les ingénieurs en structure.

## 🚀 Installation

```bash
# Installation globale
npm install -g tridyme-cli

# Vérifier l'installation
tridyme --version
```

## 📋 Commandes

### Créer un nouveau projet

```bash
# Crée un nouveau projet interactivement
tridyme create

# Crée un nouveau projet avec un nom spécifique
tridyme create mon-projet-calcul
```

La commande interactive vous demandera :

- Le nom de votre entreprise
- L'URL de la plateforme
- Le type de template à utiliser

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

### Déployer sur Render

```bash
# Dans le dossier de votre projet - déploiement via Git (méthode standard)
tridyme deploy

# Déploiement direct sans Git (nécessite une clé API Render)
tridyme deploy --direct

# Déploiement direct avec clé API fournie en argument
tridyme deploy --direct --api-key=votre_cle_api
```

Cette commande offre deux méthodes de déploiement :

1. **Via Git** : La méthode standard qui vous guide à travers le processus de déploiement en utilisant un dépôt Git.
2. **Déploiement direct** : Permet de déployer directement sur Render sans passer par Git (nécessite une clé API Render).

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

## 📦 Déploiement

### Sur Render

1. Créez un dépôt Git et poussez votre code
2. Créez un compte sur [Render](https://render.com)
3. Créez un nouveau Web Service et connectez-le à votre dépôt
4. Configuration :
   - **Build Command** : `npm run build`
   - **Start Command** : `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables** : Ajoutez les variables d'environnement de votre fichier `.env`

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT.
