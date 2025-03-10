#!/bin/bash

# Script d'installation de Tridyme CLI
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

# Créer un répertoire temporaire
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

echo -e "${BLUE}Téléchargement des fichiers nécessaires...${NC}"

# Télécharger les fichiers
curl -s -o tridyme-cli.py https://raw.githubusercontent.com/tridyme/tridyme-cli/main/tridyme-cli.py
curl -s -o setup.py https://raw.githubusercontent.com/tridyme/tridyme-cli/main/setup.py

if [ $? -ne 0 ]; then
    echo -e "${RED}Échec du téléchargement des fichiers. Vérifiez votre connexion internet.${NC}"
    exit 1
fi

echo -e "${BLUE}Installation de TridymeSDK CLI...${NC}"

# Installer le package
pip3 install --user .

if [ $? -ne 0 ]; then
    echo -e "${RED}Échec de l'installation.${NC}"
    exit 1
fi

# Nettoyer
cd ..
rm -rf $TEMP_DIR

# Vérifier si l'installation a réussi
if command -v tridyme-cli &> /dev/null; then
    echo -e "${GREEN}TridymeSDK CLI a été installé avec succès!${NC}"
    echo ""
    echo -e "Vous pouvez maintenant utiliser les commandes suivantes:"
    echo -e "  ${BLUE}tridyme-cli init <nom-du-projet>${NC} - Créer un nouveau projet"
    echo -e "  ${BLUE}tridyme-cli dev${NC} - Lancer le projet en mode développement"
    echo -e "  ${BLUE}tridyme-cli build${NC} - Construire le projet pour la production"
    echo -e "  ${BLUE}tridyme-cli deploy${NC} - Déployer sur Google Cloud GKE"
    echo -e "  ${BLUE}tridyme-cli configure${NC} - Configurer les paramètres du projet"
    echo ""
    echo -e "Pour plus d'informations, exécutez: ${BLUE}tridyme-cli --help${NC}"
else
    echo -e "${YELLOW}L'installation semble avoir réussi, mais 'tridyme-cli' n'est pas dans votre PATH.${NC}"
    echo -e "Vous devrez peut-être ajouter le répertoire des scripts Python à votre PATH:"
    echo -e "  ${BLUE}export PATH=\$PATH:\$HOME/.local/bin${NC} (pour Linux/macOS)"
fi