# TriDyme CLI

Un outil en ligne de commande pour simplifier le developpement et le deploiement d'applications TriDyme.

## Installation

```bash
npm install -g tridyme-cli
tridyme --version
```

## Authentification

```bash
tridyme login    # Se connecter avec son compte TriDyme
tridyme whoami   # Verifier sa connexion
tridyme logout   # Se deconnecter
```

Le token est stocke dans `~/.tridyme/credentials.json` (valide 30 jours).

## Commandes

### Creer un projet

```bash
tridyme create mon-application
```

Clone le SDK depuis GitHub, configure les variables d'environnement et installe les dependances.

### Developper

```bash
tridyme dev       # Lance backend (FastAPI) + frontend (React)
tridyme dev --ai  # Lance aussi Claude Code
```

### Builder

```bash
tridyme build     # Build le frontend pour la production
```

### Deployer

```bash
# Deploiement cloud (recommande)
tridyme deploy

# Deploiement via Git CI/CD (ancien mode)
tridyme deploy --git
tridyme deploy --git --env production
tridyme deploy --git --env development
```

Le deploiement cloud :
1. Package le projet en `.tar.gz`
2. Build l'image Docker via Google Cloud Build
3. Deploie sur Kubernetes (GKE)
4. Configure le DNS et le certificat SSL

L'application est accessible sur `https://{app}-{user}.tridyme.io`.

### Mettre a jour le SDK

```bash
tridyme update
```

Telecharge la derniere version du SDK depuis GitHub en preservant vos fichiers personnalises.

## Structure d'un projet

```
mon-application/
├── backend/              # API Python FastAPI
│   ├── main.py           # Point d'entree
│   ├── api.py            # Routes API
│   ├── utils/            # Logique de calcul
│   └── tests/            # Tests pytest
├── frontend/             # Interface React
│   ├── src/
│   │   ├── Views/        # Vos vues personnalisees
│   │   └── Components/   # Composants reutilisables
│   └── module-federation/ # Config Webpack Module Federation
├── k8s/                  # Manifestes Kubernetes
├── Dockerfile            # Build multi-stage
└── .env                  # Variables d'environnement
```

## Personnalisation

- `.env` - Variables d'environnement (nom app, entreprise, etc.)
- `backend/utils/calculations.py` - Logique de calcul
- `backend/schema/` - Schema des parametres
- `frontend/src/Views/` - Composants React

## Notes Windows

Si l'initialisation echoue :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

cd backend
python -m venv env
.\env\Scripts\pip.exe install -r requirements.txt

cd ..\frontend
npm install
cd module-federation
npm install
```

## Licence

MIT
