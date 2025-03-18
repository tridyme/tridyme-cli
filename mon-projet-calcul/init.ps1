# Initialisation de l'environnement Python
Write-Host "Initialisation de l'environnement Python..."
Set-Location backend
python -m venv env
. .\env\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

# Initialisation de l'application React.js
Write-Host "Initialisation de l'application React.js..."
Set-Location ..\frontend
npm install
Set-Location module-federation
npm install
Set-Location ../..

# Build de l'application React.js
Write-Host "Build de l'application React.js..."
Set-Location frontend
npm run build
Set-Location ..