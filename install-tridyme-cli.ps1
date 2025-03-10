# Script d'installation de TridymeSDK CLI pour Windows
# Ce script télécharge et installe l'outil CLI pour TridymeSDK

# Afficher la bannière
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║       Installation de TridymeSDK CLI       ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Vérifier les droits d'administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Note: Ce script ne s'exécute pas en tant qu'administrateur. Si l'installation échoue, essayez de l'exécuter en tant qu'administrateur." -ForegroundColor Yellow
}

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

# Créer un environnement virtuel
$venvPath = Join-Path $env:USERPROFILE ".tridyme-venv"
Write-Host "Création d'un environnement virtuel pour TridymeSDK CLI..." -ForegroundColor Blue

# Supprimer l'ancien environnement s'il existe
if (Test-Path $venvPath) {
    Remove-Item -Recurse -Force $venvPath
}

# Créer un nouvel environnement virtuel
try {
    python -m venv $venvPath
}
catch {
    Write-Host "Échec de la création de l'environnement virtuel: $_" -ForegroundColor Red
    exit 1
}

# Créer un répertoire temporaire
$tempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
New-Item -ItemType Directory -Path $tempDir | Out-Null
Set-Location $tempDir

Write-Host "Téléchargement des fichiers nécessaires..." -ForegroundColor Blue

# Télécharger les fichiers
try {
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tridyme/tridyme-cli/main/tridyme_cli.py" -OutFile "tridyme_cli.py"
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/tridyme/tridyme-cli/main/setup.py" -OutFile "setup.py"
}
catch {
    Write-Host "Échec du téléchargement des fichiers. Vérifiez votre connexion internet: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Installation de TridymeSDK CLI..." -ForegroundColor Blue

# Installer le package dans l'environnement virtuel
try {
    & "$venvPath\Scripts\python.exe" -m pip install .
    
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

# Créer un dossier bin dans le répertoire utilisateur s'il n'existe pas
$userBinDir = Join-Path $env:USERPROFILE "bin"
if (-not (Test-Path $userBinDir)) {
    New-Item -ItemType Directory -Path $userBinDir | Out-Null
}

# Créer un script wrapper dans le répertoire utilisateur
$wrapperPath = Join-Path $userBinDir "tridyme-cli.bat"
Write-Host "Création d'un wrapper dans $wrapperPath..." -ForegroundColor Blue

@"
@echo off
call "$venvPath\Scripts\activate.bat"
"$venvPath\Scripts\tridyme-cli.exe" %*
"@ | Out-File -FilePath $wrapperPath -Encoding ascii

# Vérifier si l'installation a réussi
if (Test-Path $wrapperPath) {
    Write-Host "TridymeSDK CLI a été installé avec succès!" -ForegroundColor Green
    
    # Vérifier si $userBinDir est dans le PATH
    $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if (-not $userPath.Contains($userBinDir)) {
        Write-Host "Remarque: $userBinDir n'est pas dans votre PATH." -ForegroundColor Yellow
        
        # Ajouter au PATH utilisateur
        $addToPath = Read-Host "Voulez-vous ajouter ce répertoire à votre PATH? (O/N)"
        if ($addToPath -eq "O" -or $addToPath -eq "o") {
            try {
                $newPath = $userPath + ";" + $userBinDir
                [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
                Write-Host "Le répertoire a été ajouté à votre PATH utilisateur." -ForegroundColor Green
                Write-Host "Vous devrez peut-être redémarrer votre terminal ou votre ordinateur pour que les changements prennent effet." -ForegroundColor Yellow
            }
            catch {
                Write-Host "Impossible d'ajouter le répertoire à votre PATH: $_" -ForegroundColor Red
                Write-Host "Vous pouvez l'ajouter manuellement dans les variables d'environnement." -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "Vous pouvez exécuter tridyme-cli avec le chemin complet:" -ForegroundColor Blue
            Write-Host "  $wrapperPath --help" -ForegroundColor Blue
        }
    }
    else {
        Write-Host ""
        Write-Host "Vous pouvez maintenant utiliser les commandes suivantes:" -ForegroundColor Blue
        Write-Host "  tridyme-cli init <nom-du-projet> - Créer un nouveau projet" -ForegroundColor Blue
        Write-Host "  tridyme-cli dev - Lancer le projet en mode développement" -ForegroundColor Blue
        Write-Host "  tridyme-cli build - Construire le projet pour la production" -ForegroundColor Blue
        Write-Host "  tridyme-cli deploy - Déployer sur Google Cloud GKE" -ForegroundColor Blue
        Write-Host "  tridyme-cli configure - Configurer les paramètres du projet" -ForegroundColor Blue
    }
    
    Write-Host ""
    Write-Host "Pour plus d'informations, exécutez: tridyme-cli --help" -ForegroundColor Blue
}
else {
    Write-Host "Échec de la création du wrapper." -ForegroundColor Red
    Write-Host "Vous pouvez toujours exécuter tridyme-cli en activant l'environnement virtuel:" -ForegroundColor Yellow
    Write-Host "  & '$venvPath\Scripts\activate.ps1'" -ForegroundColor Blue
    Write-Host "  tridyme-cli --help" -ForegroundColor Blue
}