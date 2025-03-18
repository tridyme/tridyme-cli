#!/bin/bash

# Étape 1: Mise en route de Python
echo "Initialisation de l'environnement Python..."
cd backend
python3 -m venv env
source env/bin/activate
pip install --upgrade pip
pip install -r requirements.txt


# Étape 2: Mise en route de React.js
echo "Initialisation de l'application React.js..."
cd ../frontend
npm install
cd module-federation
npm install
cd ../..

# Étape 3: Build de React.js
echo "Build de l'application React.js..."
cd frontend
npm run build
cd ..
