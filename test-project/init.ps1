# Initialisation de l'environnement Python
Write-Host "Initialisation de l'environnement Python..." -ForegroundColor Cyan
Set-Location backend
python -m venv env

# Mise à jour de pip et installation des dépendances sans using activate
Write-Host "Installation des dépendances Python..." -ForegroundColor Cyan
.\env\Scripts\python.exe -m pip install --upgrade pip
.\env\Scripts\pip.exe install -r requirements.txt

# Initialisation de l'application React.js
Write-Host "Initialisation de l'application React.js..." -ForegroundColor Cyan
Set-Location ..\frontend
npm install
Set-Location module-federation
npm install
Set-Location ../..

# Build de l'application React.js
Write-Host "Build de l'application React.js..." -ForegroundColor Cyan
Set-Location frontend
npm run build
Set-Location ..

Write-Host "✅ Projet initialisé avec succès!" -ForegroundColor Green