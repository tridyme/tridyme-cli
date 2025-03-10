# Script d'installation de TridymeSDK CLI pour Windows
# Ce script télécharge et installe l'outil CLI pour TridymeSDK

# Afficher la bannière
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║       Installation de TridymeSDK CLI       ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Vérifier si Python est installé
try {
    $pythonVersion = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
    $pythonMajor = [int]($pythonVersion.Split('.')[0])
    $pythonMinor = [int]($pythonVersion.Split('.')[1])
    
    if ($pythonMajor -lt 3 -or ($pythonMajor -eq 3 -and $pythonMinor -lt 6)) {
        Write-Host "Python 3.6+ est requis. Version détectée: $pythonVersion" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Python $pythonVersion détecté." -ForegroundColor Green
}
catch {
    Write-Host "Python 3 n'est pas installé ou n'est pas dans votre PATH. Veuillez l'installer avant de continuer." -ForegroundColor Red
    exit 1
}

# Créer un répertoire temporaire
$tempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
New-Item -ItemType Directory -Path $tempDir | Out-Null
Set-Location $tempDir

Write-Host "Téléchargement des fichiers nécessaires..." -ForegroundColor Blue

# Télécharger les fichiers
try {
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tridyme/tridyme-cli/main/tridyme-cli.py" -OutFile "tridyme-cli.py"
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tridyme/tridyme-cli/main/setup.py" -OutFile "setup.py"
}
catch {
    Write-Host "Échec du téléchargement des fichiers. Vérifiez votre connexion internet." -ForegroundColor Red
    exit 1
}

Write-Host "Installation de TridymeSDK CLI..." -ForegroundColor Blue

# Installer le package
try {
    pip install --user .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Échec de l'installation." -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Échec de l'installation: $_" -ForegroundColor Red
    exit 1
}

# Nettoyer
Set-Location ..
Remove-Item -Recurse -Force $tempDir

# Vérifier si l'installation a réussi
try {
    $tridymePath = (Get-Command tridyme-cli -ErrorAction SilentlyContinue).Source
    if ($tridymePath) {
        Write-Host "TridymeSDK CLI a été installé avec succès!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Vous pouvez maintenant utiliser les commandes suivantes:"
        Write-Host "  tridyme-cli init <nom-du-projet> - Créer un nouveau projet" -ForegroundColor Blue
        Write-Host "  tridyme-cli dev - Lancer le projet en mode développement" -ForegroundColor Blue
        Write-Host "  tridyme-cli build - Construire le projet pour la production" -ForegroundColor Blue
        Write-Host "  tridyme-cli deploy - Déployer sur Google Cloud GKE" -ForegroundColor Blue
        Write-Host "  tridyme-cli configure - Configurer les paramètres du projet" -ForegroundColor Blue
        Write-Host ""
        Write-Host "Pour plus d'informations, exécutez: tridyme-cli --help" -ForegroundColor Blue
    }
    else {
        Write-Host "L'installation semble avoir réussi, mais 'tridyme-cli' n'est pas dans votre PATH." -ForegroundColor Yellow
        Write-Host "Vous devrez peut-être redémarrer votre terminal ou votre ordinateur pour que les changements prennent effet." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "L'installation semble avoir réussi, mais 'tridyme-cli' n'est pas dans votre PATH." -ForegroundColor Yellow
    Write-Host "Vous devrez peut-être redémarrer votre terminal ou votre ordinateur pour que les changements prennent effet." -ForegroundColor Yellow
}