# Guide de Deploiement - TriDyme CLI

## Prerequisites

| Outil | Version minimale |
|-------|-----------------|
| Node.js | >= 16.0.0 |
| npm | >= 8.0.0 |
| Python | >= 3.10 |
| Git | derniere version stable |

## 1. Installation du CLI

```bash
npm install -g @tridyme/cli
```

Verifier l'installation :

```bash
tridyme --version
```

## 2. Authentification

### Se connecter

```bash
tridyme login
```

Le CLI demande :
- **Email** : votre adresse email enregistree sur la plateforme TriDyme
- **Mot de passe** : votre mot de passe

Un token est genere et stocke localement dans `~/.tridyme/credentials.json` (valide 30 jours).

### Verifier sa connexion

```bash
tridyme whoami
```

### Se deconnecter

```bash
tridyme logout
```

## 3. Creer un projet

```bash
tridyme create mon-application
```

Le CLI guide l'utilisateur a travers :
1. Nom de l'application
2. Nom de l'entreprise
3. URL de l'API plateforme
4. Configuration optionnelle de Claude Code (IA)

### Structure du projet genere

```
mon-application/
├── backend/
│   ├── main.py              # Point d'entree FastAPI
│   ├── api.py               # Routes API
│   ├── requirements.txt     # Dependances Python
│   ├── models/              # Modeles de donnees
│   ├── schema/              # Schemas Pydantic
│   ├── utils/               # Utilitaires / calculs
│   └── tests/               # Tests unitaires
├── frontend/
│   ├── package.json
│   ├── src/                 # Code source React
│   ├── module-federation/   # Config Webpack Module Federation
│   ├── .env.development
│   └── .env.production
├── k8s/                     # Manifestes Kubernetes
├── Dockerfile               # Build multi-stage
├── .env                     # Variables d'environnement
├── .gitlab-ci.yml           # Pipeline CI/CD
└── README.md
```

## 4. Developpement local

### Lancer le serveur de developpement

```bash
cd mon-application
tridyme dev
```

Cette commande :
- Cree/verifie l'environnement virtuel Python (`backend/env/`)
- Installe les dependances Python si necessaire
- Lance le backend FastAPI sur `http://localhost:8000`
- Lance le frontend React sur `http://localhost:3000`

### Avec Claude Code (IA)

```bash
tridyme dev --ai
```

### Builder le frontend

```bash
tridyme build
```

Genere les fichiers de production dans `frontend/build/`.

## 5. Deploiement

### Methode 1 : Deploiement Cloud (recommandee)

```bash
tridyme deploy
```

#### Ce qui se passe en arriere-plan :

1. **Validation** : verifie la structure du projet (`backend/`, `frontend/`, `main.py`, `requirements.txt`, `package.json`)
2. **Authentification** : verifie le token CLI
3. **Identification** : determine l'application via `REACT_APP_APPLICATION_ID` dans `.env` (ou propose une selection)
4. **Packaging** : compresse le projet en `.tar.gz` (max 100 MB)
   - Exclusions automatiques : `node_modules/`, `.git/`, `env/`, `venv/`, `__pycache__/`, `.env`, `frontend/build/`, etc.
5. **Upload** : envoie l'archive au serveur de deploiement
6. **Build Docker** : Google Cloud Build construit l'image Docker
7. **Deploiement K8s** : deploiement sur le cluster Kubernetes (GKE)
8. **Configuration DNS** : creation de l'enregistrement DNS
9. **SSL** : provisionnement automatique du certificat HTTPS

#### Suivi en temps reel :

Le CLI affiche la progression toutes les 5 secondes :

```
⏳ En file d'attente...
📤 Upload du code source...
🔨 Construction de l'image Docker (cela peut prendre quelques minutes)...
📦 Push de l'image vers le registry...
🚀 Deploiement sur Kubernetes...
🌐 Configuration DNS et SSL...
✅ Deploiement reussi !
```

#### Resultat :

```
URL: https://mon-application-prenom-nom.tridyme.io
Application: mon-application
Version: 1
Namespace: dev-prenom-nom

Note: Le certificat SSL peut prendre 10-15 minutes.
L'application est accessible immediatement en HTTP.
```

### Methode 2 : Deploiement Git CI/CD

```bash
tridyme deploy --git
```

Ou en specifiant l'environnement :

```bash
tridyme deploy --env production    # Branche main
tridyme deploy --env development   # Branche develop
```

#### Ce qui se passe :

1. Verifie le depot Git (initialise si necessaire)
2. Gere les changements non commites
3. Bascule sur la branche cible (`main` ou `develop`)
4. Merge les changements si necessaire
5. Build le frontend (en production)
6. Push vers le remote Git
7. Le pipeline CI/CD prend le relais

## 6. URL de l'application deployee

| Environnement | Format de l'URL |
|---------------|----------------|
| Cloud | `https://{app-slug}-{username-slug}.tridyme.io` |
| Production (Git) | `https://{project-name}.tridyme.com` |
| Development (Git) | `https://{project-name}-dev.tridyme.com` |

Le slug est genere automatiquement a partir du nom de l'application et du nom de l'utilisateur.

**Exemple** : Application "Mon Calcul" par "Jean Dupont" → `https://mon-calcul-jean-dupont.tridyme.io`

## 7. Fichier .env

Le fichier `.env` a la racine du projet contient les variables essentielles :

```bash
ENVIRONMENT="development"
REACT_APP_APPLICATION_NAME="Mon Application"
REACT_APP_APPLICATION_ID="65a1b2c3d4e5f6789abcdef0"
REACT_APP_APPLICATION_API_URL="http://localhost:8000"
REACT_APP_PLATFORM_API_URL="https://platform.tridyme.com/api"
```

> **Important** : Le fichier `.env` n'est PAS inclus dans l'archive de deploiement. Les variables de production sont injectees automatiquement lors du build Docker.

## 8. Dockerfile

Le projet inclut un Dockerfile multi-stage :

- **Stage 1** (Node 18) : Build du frontend React
- **Stage 2** (Python 3.11) : Installation des dependances backend
- **Stage 3** (Python 3.11) : Image finale de production

Le backend sert le frontend en mode production. L'application ecoute sur le **port 8000**.

### Endpoints requis

L'application deployee doit exposer :

| Endpoint | Usage |
|----------|-------|
| `/health` | Sonde de vivacite Kubernetes (liveness probe) |
| `/ready` | Sonde de disponibilite Kubernetes (readiness probe) |

Ces endpoints sont deja inclus dans le template SDK.

## 9. Ressources Kubernetes

Chaque deploiement cree automatiquement :

| Ressource | Description |
|-----------|-------------|
| **Namespace** | `dev-{username}` - isole par developpeur |
| **Deployment** | 1 replica, 128Mi-512Mi RAM, 100m-500m CPU |
| **Service** | ClusterIP, port 80 → 8000 |
| **Ingress** | GCE avec IP statique globale |
| **ManagedCertificate** | Certificat SSL automatique Google |

### Quotas par namespace

| Ressource | Limite |
|-----------|--------|
| Pods | 10 |
| CPU (requests) | 2 cores |
| CPU (limits) | 4 cores |
| RAM (requests) | 2 Gi |
| RAM (limits) | 4 Gi |
| PVC | 5 |

## 10. Depannage

### "Non connecte. Lancez: tridyme login"

Token expire ou absent. Relancez `tridyme login`.

### "Structure de projet invalide"

Verifiez que les fichiers suivants existent :
- `backend/` (repertoire)
- `frontend/` (repertoire)
- `backend/main.py`
- `backend/requirements.txt`
- `frontend/package.json`

### "Archive trop volumineuse (max 100 MB)"

Verifiez que `node_modules/`, `.git/`, `__pycache__/` ne sont pas inclus. Si le probleme persiste, nettoyez les fichiers temporaires.

### Le deploiement echoue au build Docker

- Verifiez que le `Dockerfile` est a la racine du projet
- Verifiez que `backend/requirements.txt` est complet
- Verifiez que `frontend/package.json` est valide
- Consultez les logs via l'URL fournie par le CLI

### Le certificat SSL n'est pas actif

Le provisionnement du certificat SSL Google peut prendre **10 a 15 minutes**. L'application est accessible en HTTP immediatement.

### Conflit de merge (deploiement Git)

```bash
git status                         # Voir les fichiers en conflit
# Resoudre les conflits manuellement
git add .
git commit -m "Resolution des conflits"
tridyme deploy --env production    # Relancer
```

## Recapitulatif des commandes

```bash
# Installation
npm install -g @tridyme/cli

# Authentification
tridyme login
tridyme whoami
tridyme logout

# Projet
tridyme create mon-app
tridyme dev
tridyme build

# Deploiement
tridyme deploy                     # Cloud (recommande)
tridyme deploy --git               # Via Git CI/CD
tridyme deploy --env production    # Git + env specifique

# Mise a jour
tridyme update
```
