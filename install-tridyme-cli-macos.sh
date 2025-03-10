#!/bin/bash

# Script d'installation de TridymeSDK CLI pour macOS
# Ce script télécharge et installe l'outil CLI pour TridymeSDK

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Afficher la bannière
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║       Installation de TridymeSDK CLI       ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 n'est pas installé. Veuillez l'installer avant de continuer.${NC}"
    exit 1
fi

# Vérifier la version de Python
PYTHON_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d. -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d. -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 6 ]); then
    echo -e "${RED}Python 3.6+ est requis. Version détectée: $PYTHON_VERSION${NC}"
    exit 1
fi

echo -e "${GREEN}Python $PYTHON_VERSION détecté.${NC}"

# Créer un environnement virtuel
echo -e "${BLUE}Création d'un environnement virtuel pour TridymeSDK CLI...${NC}"
VENV_PATH="$HOME/.tridyme-venv"

# Supprimer l'ancien environnement s'il existe
if [ -d "$VENV_PATH" ]; then
    rm -rf "$VENV_PATH"
fi

# Créer un nouvel environnement virtuel
python3 -m venv "$VENV_PATH"
if [ $? -ne 0 ]; then
    echo -e "${RED}Échec de la création de l'environnement virtuel.${NC}"
    exit 1
fi

# Activer l'environnement virtuel
source "$VENV_PATH/bin/activate"
if [ $? -ne 0 ]; then
    echo -e "${RED}Échec de l'activation de l'environnement virtuel.${NC}"
    exit 1
fi

# Créer un répertoire temporaire
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

echo -e "${BLUE}Téléchargement des fichiers nécessaires...${NC}"

# Télécharger les fichiers
curl -s -o tridyme_cli.py https://raw.githubusercontent.com/tridyme/tridyme-cli/main/tridyme_cli.py
curl -s -o setup.py https://raw.githubusercontent.com/tridyme/tridyme-cli/main/setup.py

if [ $? -ne 0 ]; then
    echo -e "${RED}Échec du téléchargement des fichiers. Vérifiez votre connexion internet.${NC}"
    exit 1
fi

echo -e "${BLUE}Installation de TridymeSDK CLI...${NC}"

# Installer le package dans l'environnement virtuel
pip install .

if [ $? -ne 0 ]; then
    echo -e "${RED}Échec de l'installation.${NC}"
    exit 1
fi

# Nettoyer
cd ..
rm -rf $TEMP_DIR

# Créer le dossier bin dans le répertoire utilisateur s'il n'existe pas
USER_BIN_DIR="$HOME/bin"
mkdir -p "$USER_BIN_DIR"

# Créer un script wrapper dans le répertoire utilisateur
WRAPPER_PATH="$USER_BIN_DIR/tridyme-cli"
echo -e "${BLUE}Création d'un wrapper dans $WRAPPER_PATH...${NC}"

echo '#!/bin/bash
source "'$VENV_PATH'/bin/activate"
"'$VENV_PATH'/bin/tridyme-cli" "$@"
' > "$WRAPPER_PATH"

# Rendre le wrapper exécutable
chmod +x "$WRAPPER_PATH"

# Vérifier si l'installation a réussi
if [ -f "$WRAPPER_PATH" ]; then
    echo -e "${GREEN}TridymeSDK CLI a été installé avec succès!${NC}"
    
    # Vérifier si $HOME/bin est dans le PATH
    if [[ ":$PATH:" != *":$USER_BIN_DIR:"* ]]; then
        echo -e "${YELLOW}Remarque: $USER_BIN_DIR n'est pas dans votre PATH.${NC}"
        echo -e "Pour ajouter ce répertoire à votre PATH, exécutez:"
        
        # Déterminer le shell utilisé
        if [ -n "$ZSH_VERSION" ]; then
            SHELL_CONFIG="$HOME/.zshrc"
        elif [ -n "$BASH_VERSION" ]; then
            SHELL_CONFIG="$HOME/.bash_profile"
            if [ ! -f "$SHELL_CONFIG" ]; then
                SHELL_CONFIG="$HOME/.bashrc"
            fi
        else
            SHELL_CONFIG="votre fichier de configuration shell"
        fi
        
        echo -e "  ${BLUE}echo 'export PATH=\"$USER_BIN_DIR:\$PATH\"' >> $SHELL_CONFIG${NC}"
        echo -e "  ${BLUE}source $SHELL_CONFIG${NC}"
        echo ""
        echo -e "Ou vous pouvez exécuter tridyme-cli avec le chemin complet:"
        echo -e "  ${BLUE}$WRAPPER_PATH --help${NC}"
    else
        echo ""
        echo -e "Vous pouvez maintenant utiliser les commandes suivantes:"
        echo -e "  ${BLUE}tridyme-cli init <nom-du-projet>${NC} - Créer un nouveau projet"
        echo -e "  ${BLUE}tridyme-cli dev${NC} - Lancer le projet en mode développement"
        echo -e "  ${BLUE}tridyme-cli build${NC} - Construire le projet pour la production"
        echo -e "  ${BLUE}tridyme-cli deploy${NC} - Déployer sur Google Cloud GKE"
        echo -e "  ${BLUE}tridyme-cli configure${NC} - Configurer les paramètres du projet"
    fi
    
    echo ""
    echo -e "Pour plus d'informations, exécutez: ${BLUE}tridyme-cli --help${NC}"
else
    echo -e "${RED}Échec de la création du wrapper.${NC}"
    echo -e "Vous pouvez toujours exécuter tridyme-cli en activant l'environnement virtuel:"
    echo -e "  ${BLUE}source $VENV_PATH/bin/activate${NC}"
    echo -e "  ${BLUE}tridyme-cli --help${NC}"
fi