#!/usr/bin/env python3
"""
TridymeSDK CLI - Outil simplifié de gestion des applications TridymeSDK
"""

import os
import sys
import argparse
import subprocess
import shutil
import platform
import urllib.request
import zipfile
import json
from pathlib import Path
import getpass

# Couleurs pour les messages
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# Configuration et constantes
TRIDYME_REPO = "https://github.com/tridyme/sdk-webapp-python.git"
TRIDYME_ZIP = "https://github.com/tridyme/sdk-webapp-python/archive/refs/heads/main.zip"
CONFIG_FILE = ".tridyme-config.json"
DEFAULT_CONFIG = {
    "project_name": "",
    "gcp_project": "",
    "gcp_region": "europe-west1",
    "gcp_cluster": "",
    "gcp_repository": ""
}

def print_header():
    """Affiche l'en-tête de l'application"""
    print(f"{Colors.BLUE}{Colors.BOLD}")
    print("╔════════════════════════════════════════════╗")
    print("║              TridymeSDK CLI                ║")
    print("╚════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")

def run_command(command, cwd=None, check=True, shell=False):
    """Exécute une commande système et affiche le résultat"""
    try:
        if shell:
            process = subprocess.run(command, shell=True, check=check, cwd=cwd, text=True)
        else:
            process = subprocess.run(command, check=check, cwd=cwd, text=True)
        return process.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"{Colors.RED}Erreur lors de l'exécution de la commande: {e}{Colors.ENDC}")
        return False

def check_dependencies():
    """Vérifie si les dépendances requises sont installées"""
    missing_deps = []
    
    # Vérifier Python
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 6):
        missing_deps.append("Python 3.6+")
    
    # Vérifier Node.js
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        missing_deps.append("Node.js")
    
    # Vérifier npm
    try:
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        missing_deps.append("npm")
    
    # Vérifier git (optionnel pour le téléchargement zip)
    try:
        subprocess.run(["git", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(f"{Colors.YELLOW}Note: Git n'est pas installé. Le téléchargement zip sera utilisé.{Colors.ENDC}")
    
    if missing_deps:
        print(f"{Colors.RED}Les dépendances suivantes sont manquantes: {', '.join(missing_deps)}{Colors.ENDC}")
        print(f"Veuillez les installer avant de continuer.")
        return False
    
    return True

def is_git_available():
    """Vérifie si git est disponible"""
    try:
        subprocess.run(["git", "--version"], check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def load_config():
    """Charge la configuration du projet"""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return DEFAULT_CONFIG.copy()

def save_config(config):
    """Sauvegarde la configuration du projet"""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

def init_project(args):
    """Initialise un nouveau projet"""
    print_header()
    print(f"{Colors.GREEN}Initialisation d'un nouveau projet TridymeSDK...{Colors.ENDC}")
    
    # Vérifier les dépendances
    if not check_dependencies():
        return
    
    project_name = args.name
    target_dir = os.path.join(os.getcwd(), project_name)
    
    # Vérifier si le répertoire existe déjà
    if os.path.exists(target_dir):
        print(f"{Colors.RED}Le répertoire {project_name} existe déjà.{Colors.ENDC}")
        overwrite = input("Voulez-vous le remplacer? (o/N): ").lower() == 'o'
        if overwrite:
            shutil.rmtree(target_dir)
        else:
            print("Initialisation annulée.")
            return
    
    # Créer le répertoire du projet
    os.makedirs(target_dir, exist_ok=True)
    
    # Télécharger le code
    os.chdir(target_dir)
    
    if is_git_available() and args.method == 'git':
        print(f"{Colors.BLUE}Téléchargement du code source via Git...{Colors.ENDC}")
        success = run_command(["git", "clone", TRIDYME_REPO, "."])
    else:
        print(f"{Colors.BLUE}Téléchargement du code source via zip...{Colors.ENDC}")
        # Télécharger et extraire le zip
        zip_path = os.path.join(target_dir, "sdk-webapp-python.zip")
        try:
            urllib.request.urlretrieve(TRIDYME_ZIP, zip_path)
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(target_dir)
            
            # Déplacer les fichiers du dossier extrait vers la racine
            extracted_dir = os.path.join(target_dir, "sdk-webapp-python-main")
            for item in os.listdir(extracted_dir):
                s = os.path.join(extracted_dir, item)
                d = os.path.join(target_dir, item)
                if os.path.isdir(s):
                    shutil.copytree(s, d, dirs_exist_ok=True)
                else:
                    shutil.copy2(s, d)
            
            # Nettoyer
            shutil.rmtree(extracted_dir)
            os.remove(zip_path)
            success = True
        except Exception as e:
            print(f"{Colors.RED}Erreur lors du téléchargement ou de l'extraction: {e}{Colors.ENDC}")
            success = False
    
    if not success:
        print(f"{Colors.RED}Échec de l'initialisation du projet.{Colors.ENDC}")
        return
    
    # Créer le fichier de configuration
    config = DEFAULT_CONFIG.copy()
    config["project_name"] = project_name
    save_config(config)
    
    # Personnaliser le projet
    if args.customize:
        print(f"{Colors.BLUE}Personnalisation du projet...{Colors.ENDC}")
        
        # Modifier les fichiers de configuration
        env_file = os.path.join(target_dir, ".env")
        if os.path.exists(env_file):
            with open(env_file, 'r') as f:
                env_content = f.read()
            
            env_content = env_content.replace("REACT_APP_COMPANY=\"Socotec\"", f"REACT_APP_COMPANY=\"{project_name}\"")
            env_content = env_content.replace("REACT_APP_LOGO=\"./EC2-Ferraillage.svg\"", "REACT_APP_LOGO=\"./logo.svg\"")
            
            with open(env_file, 'w') as f:
                f.write(env_content)
        
        # Idem pour les fichiers .env.development et .env.production
        for env_filename in [".env.development", ".env.production"]:
            env_file = os.path.join(target_dir, "frontend", env_filename)
            if os.path.exists(env_file):
                with open(env_file, 'r') as f:
                    env_content = f.read()
                
                env_content = env_content.replace("REACT_APP_COMPANY=\"Socotec\"", f"REACT_APP_COMPANY=\"{project_name}\"")
                env_content = env_content.replace("REACT_APP_LOGO=\"./EC2-Ferraillage.svg\"", "REACT_APP_LOGO=\"./logo.svg\"")
                env_content = env_content.replace("REACT_APP_APPLICATION_NAME=\"EC2-Ferraillage\"", f"REACT_APP_APPLICATION_NAME=\"{project_name}\"")
                
                with open(env_file, 'w') as f:
                    f.write(env_content)
    
    # Lancer l'installation
    print(f"{Colors.BLUE}Installation des dépendances...{Colors.ENDC}")
    
    is_windows = platform.system() == "Windows"
    init_script = "init.ps1" if is_windows else "init.sh"
    
    if is_windows:
        success = run_command(["powershell", "-ExecutionPolicy", "Bypass", "-File", init_script], cwd=target_dir)
    else:
        # Rendre le script exécutable
        os.chmod(os.path.join(target_dir, init_script), 0o755)
        success = run_command([f"./{init_script}"], cwd=target_dir, shell=True)
    
    if success:
        print(f"{Colors.GREEN}Projet {project_name} initialisé avec succès!{Colors.ENDC}")
        print(f"Pour démarrer le développement, exécutez:")
        print(f"  cd {project_name}")
        print(f"  tridyme-cli dev")
    else:
        print(f"{Colors.RED}Échec de l'installation des dépendances.{Colors.ENDC}")
        print(f"Vous pouvez essayer de les installer manuellement:")
        print(f"  cd {project_name}")
        print(f"  ./{init_script}")

def start_dev(args):
    """Lance le projet en mode développement"""
    print_header()
    print(f"{Colors.GREEN}Lancement du projet en mode développement...{Colors.ENDC}")
    
    config = load_config()
    
    # Ouvrir deux terminaux, un pour le backend et un pour le frontend
    is_windows = platform.system() == "Windows"
    
    # Activer l'environnement virtuel et lancer le backend
    print(f"{Colors.BLUE}Lancement du backend...{Colors.ENDC}")
    backend_dir = os.path.join(os.getcwd(), "backend")
    
    # Vérifier si l'environnement virtuel existe
    env_dir = os.path.join(backend_dir, "env")
    if not os.path.exists(env_dir):
        print(f"{Colors.YELLOW}L'environnement virtuel n'existe pas. Création...{Colors.ENDC}")
        run_command(["python", "-m", "venv", "env"], cwd=backend_dir)
    
    # Lancer le backend dans un nouveau terminal
    if is_windows:
        backend_cmd = f'start cmd /k "cd {backend_dir} && .\\env\\Scripts\\activate && python main.py"'
        run_command(backend_cmd, shell=True)
    else:
        # Pour macOS et Linux, utiliser une approche différente
        terminal_cmd = "gnome-terminal" if os.path.exists("/usr/bin/gnome-terminal") else "xterm"
        if platform.system() == "Darwin":  # macOS
            terminal_cmd = "open -a Terminal"
            backend_cmd = f"{terminal_cmd} {backend_dir} && bash -c 'cd {backend_dir} && source env/bin/activate && python3 main.py'"
        else:
            backend_cmd = f"{terminal_cmd} -- bash -c 'cd {backend_dir} && source env/bin/activate && python3 main.py; exec bash'"
        
        run_command(backend_cmd, shell=True)
    
    # Lancer le frontend
    print(f"{Colors.BLUE}Lancement du frontend...{Colors.ENDC}")
    frontend_dir = os.path.join(os.getcwd(), "frontend")
    
    if is_windows:
        frontend_cmd = f'start cmd /k "cd {frontend_dir} && npm run start"'
        run_command(frontend_cmd, shell=True)
    else:
        if platform.system() == "Darwin":  # macOS
            frontend_cmd = f"{terminal_cmd} {frontend_dir} && bash -c 'cd {frontend_dir} && npm run start'"
        else:
            frontend_cmd = f"{terminal_cmd} -- bash -c 'cd {frontend_dir} && npm run start; exec bash'"
        
        run_command(frontend_cmd, shell=True)
    
    print(f"{Colors.GREEN}L'application devrait se lancer dans votre navigateur.{Colors.ENDC}")
    print(f"Pour arrêter les serveurs, fermez les fenêtres de terminal ou utilisez Ctrl+C dans chaque terminal.")

def build_project(args):
    """Construit le projet pour la production"""
    print_header()
    print(f"{Colors.GREEN}Construction du projet pour la production...{Colors.ENDC}")
    
    config = load_config()
    
    # Construire le frontend
    print(f"{Colors.BLUE}Construction du frontend...{Colors.ENDC}")
    frontend_dir = os.path.join(os.getcwd(), "frontend")
    success = run_command(["npm", "run", "build"], cwd=frontend_dir)
    
    if not success:
        print(f"{Colors.RED}Échec de la construction du frontend.{Colors.ENDC}")
        return
    
    # Construire l'image Docker si demandé
    if args.docker:
        print(f"{Colors.BLUE}Construction de l'image Docker...{Colors.ENDC}")
        
        # Vérifier si Docker est installé
        try:
            subprocess.run(["docker", "--version"], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"{Colors.RED}Docker n'est pas installé. Veuillez l'installer pour continuer.{Colors.ENDC}")
            return
        
        # Construire l'image
        tag = args.tag or f"{config['project_name']}:latest"
        success = run_command(["docker", "build", "-t", tag, "."])
        
        if success:
            print(f"{Colors.GREEN}Image Docker construite avec succès: {tag}{Colors.ENDC}")
        else:
            print(f"{Colors.RED}Échec de la construction de l'image Docker.{Colors.ENDC}")
            return
    
    print(f"{Colors.GREEN}Construction terminée avec succès!{Colors.ENDC}")

def deploy_project(args):
    """Déploie le projet sur Google Cloud GKE"""
    print_header()
    print(f"{Colors.GREEN}Déploiement du projet sur Google Cloud GKE...{Colors.ENDC}")
    
    config = load_config()
    
    # Vérifier si gcloud est installé
    try:
        subprocess.run(["gcloud", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(f"{Colors.RED}Google Cloud SDK (gcloud) n'est pas installé.{Colors.ENDC}")
        print("Veuillez l'installer: https://cloud.google.com/sdk/docs/install")
        return
    
    # Vérifier si kubectl est installé
    try:
        subprocess.run(["kubectl", "version", "--client"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print(f"{Colors.RED}kubectl n'est pas installé.{Colors.ENDC}")
        print("Veuillez l'installer avec: gcloud components install kubectl")
        return
    
    # Demander les informations GCP si elles ne sont pas déjà configurées
    if not config["gcp_project"]:
        config["gcp_project"] = input("Projet GCP (ex: my-gcp-project): ").strip()
    
    if not config["gcp_cluster"]:
        config["gcp_cluster"] = input("Nom du cluster GKE (ex: my-cluster): ").strip()
    
    if not config["gcp_repository"]:
        config["gcp_repository"] = input("Dépôt Artifact Registry (ex: my-repo): ").strip()
    
    save_config(config)
    
    # Se connecter au cluster GKE
    print(f"{Colors.BLUE}Connexion au cluster GKE...{Colors.ENDC}")
    cmd = [
        "gcloud", "container", "clusters", "get-credentials",
        config["gcp_cluster"], "--region", config["gcp_region"],
        "--project", config["gcp_project"]
    ]
    
    if not run_command(cmd):
        print(f"{Colors.RED}Échec de la connexion au cluster GKE.{Colors.ENDC}")
        return
    
    # Construire et push l'image Docker
    print(f"{Colors.BLUE}Construction et push de l'image Docker...{Colors.ENDC}")
    
    image_name = f"{config['gcp_region']}-docker.pkg.dev/{config['gcp_project']}/{config['gcp_repository']}/{config['project_name']}:latest"
    
    # Construction de l'image Docker
    if not run_command(["docker", "build", "-t", image_name, "."]):
        print(f"{Colors.RED}Échec de la construction de l'image Docker.{Colors.ENDC}")
        return
    
    # Configuration de l'authentification Docker
    run_command([
        "gcloud", "auth", "configure-docker", 
        f"{config['gcp_region']}-docker.pkg.dev"
    ])
    
    # Push de l'image
    if not run_command(["docker", "push", image_name]):
        print(f"{Colors.RED}Échec du push de l'image Docker.{Colors.ENDC}")
        return
    
    # Déploiement sur GKE
    print(f"{Colors.BLUE}Déploiement sur GKE...{Colors.ENDC}")
    
    # Création des fichiers Kubernetes
    deployment_yaml = f"""apiVersion: apps/v1
kind: Deployment
metadata:
  name: {config['project_name']}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {config['project_name']}
  template:
    metadata:
      labels:
        app: {config['project_name']}
    spec:
      containers:
      - name: {config['project_name']}
        image: {image_name}
        ports:
        - containerPort: 8000
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: {config['project_name']}
spec:
  selector:
    app: {config['project_name']}
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {config['project_name']}
  annotations:
    kubernetes.io/ingress.class: "gce"
spec:
  rules:
  - http:
      paths:
      - path: /{config['project_name']}/*
        pathType: Prefix
        backend:
          service:
            name: {config['project_name']}
            port:
              number: 80
"""
    
    # Écrire le fichier de déploiement
    with open("kubernetes-deploy.yaml", "w") as f:
        f.write(deployment_yaml)
    
    # Appliquer la configuration
    if run_command(["kubectl", "apply", "-f", "kubernetes-deploy.yaml"]):
        print(f"{Colors.GREEN}Déploiement effectué avec succès!{Colors.ENDC}")
        print(f"L'application sera accessible à l'adresse: https://votre-domaine.com/{config['project_name']}/")
    else:
        print(f"{Colors.RED}Échec du déploiement.{Colors.ENDC}")

def configure(args):
    """Configure les paramètres du projet"""
    print_header()
    print(f"{Colors.GREEN}Configuration du projet...{Colors.ENDC}")
    
    config = load_config()
    
    # Mettre à jour les valeurs de configuration
    if args.project_name:
        config["project_name"] = args.project_name
    
    if args.gcp_project:
        config["gcp_project"] = args.gcp_project
    
    if args.gcp_region:
        config["gcp_region"] = args.gcp_region
    
    if args.gcp_cluster:
        config["gcp_cluster"] = args.gcp_cluster
    
    if args.gcp_repository:
        config["gcp_repository"] = args.gcp_repository
    
    # Si aucun argument n'a été fourni, demander interactivement
    if not any([args.project_name, args.gcp_project, args.gcp_region, args.gcp_cluster, args.gcp_repository]):
        config["project_name"] = input(f"Nom du projet [{config['project_name']}]: ").strip() or config["project_name"]
        config["gcp_project"] = input(f"Projet GCP [{config['gcp_project']}]: ").strip() or config["gcp_project"]
        config["gcp_region"] = input(f"Région GCP [{config['gcp_region']}]: ").strip() or config["gcp_region"]
        config["gcp_cluster"] = input(f"Cluster GKE [{config['gcp_cluster']}]: ").strip() or config["gcp_cluster"]
        config["gcp_repository"] = input(f"Dépôt Artifact Registry [{config['gcp_repository']}]: ").strip() or config["gcp_repository"]
    
    save_config(config)
    print(f"{Colors.GREEN}Configuration enregistrée.{Colors.ENDC}")

def main():
    parser = argparse.ArgumentParser(description="TridymeSDK CLI - Outil de gestion des applications TridymeSDK")
    subparsers = parser.add_subparsers(dest="command", help="Commande à exécuter")
    
    # Commande init
    init_parser = subparsers.add_parser("init", help="Initialiser un nouveau projet")
    init_parser.add_argument("name", help="Nom du projet")
    init_parser.add_argument("--method", choices=["git", "zip"], default="git", help="Méthode de téléchargement (git ou zip)")
    init_parser.add_argument("--customize", action="store_true", help="Personnaliser automatiquement le projet")
    
    # Commande dev
    dev_parser = subparsers.add_parser("dev", help="Lancer le projet en mode développement")
    
    # Commande build
    build_parser = subparsers.add_parser("build", help="Construire le projet pour la production")
    build_parser.add_argument("--docker", action="store_true", help="Construire aussi l'image Docker")
    build_parser.add_argument("--tag", help="Tag pour l'image Docker")
    
    # Commande deploy
    deploy_parser = subparsers.add_parser("deploy", help="Déployer sur Google Cloud GKE")
    
    # Commande configure
    config_parser = subparsers.add_parser("configure", help="Configurer les paramètres du projet")
    config_parser.add_argument("--project-name", help="Nom du projet")
    config_parser.add_argument("--gcp-project", help="ID du projet GCP")
    config_parser.add_argument("--gcp-region", help="Région GCP")
    config_parser.add_argument("--gcp-cluster", help="Nom du cluster GKE")
    config_parser.add_argument("--gcp-repository", help="Nom du dépôt Artifact Registry")
    
    args = parser.parse_args()
    
    if args.command == "init":
        init_project(args)
    elif args.command == "dev":
        start_dev(args)
    elif args.command == "build":
        build_project(args)
    elif args.command == "deploy":
        deploy_project(args)
    elif args.command == "configure":
        configure(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()