#!/bin/bash

# Étape 1: Lancement du serveur python
echo "Lancement du serveur backend."
cd backend
source env/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python3 main.py


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
