# Backend - Guide Développeur

Ce guide vous aidera à comprendre et développer le backend Python de l'application TriDyme.

## Table des matières

- [Installation](#installation)
- [Architecture](#architecture)
- [Tests unitaires](#tests-unitaires)
- [API Documentation](#api-documentation)
- [Développement](#développement)

## <a name="installation"></a>Installation

### 1/ Création d'un environnement virtuel

```shell
$ python3 -m venv env
```

### 2/ Activation de l'environnement virtuel

Sur Mac/Linux :
```shell
$ source env/bin/activate
```

Sur Windows :
```shell
$ .\env\Scripts\activate
```

### 3/ Installation des librairies

Mettre à jour pip:

```shell
$ pip install --upgrade pip
```

```shell
$ python3 -m pip install -r requirements.txt
```

### 4/ Lancement du serveur

```shell
$ python3 main.py
```

Le serveur sera accessible sur `http://localhost:8000`

## <a name="architecture"></a>Architecture

```
backend/
├── api.py              # Routes API et logique métier
├── main.py             # Point d'entrée de l'application
├── requirements.txt    # Dépendances Python
├── pytest.ini         # Configuration des tests
└── tests/              # Tests unitaires
    ├── __init__.py
    └── test_api.py     # Tests des routes API
```

## <a name="tests-unitaires"></a>Tests unitaires

### Pourquoi tester ?

Les tests unitaires permettent de :
- 🔍 **Détecter les bugs** avant la mise en production
- 🛡️ **Prévenir les régressions** lors des modifications
- 📚 **Documenter** le comportement attendu du code
- 🚀 **Faciliter le développement** en équipe

### Framework de test : pytest

Ce projet utilise **pytest**, un framework de test Python moderne et puissant.

### Installation des dépendances de test

Les dépendances de test sont déjà incluses dans `requirements.txt` :
```
pytest          # Framework de test
pytest-cov     # Couverture de code
httpx          # Client HTTP pour tester FastAPI
```

### Structure d'un test

Un test suit cette structure de base :

```python
def test_nom_du_test():
    # Arrange - Préparer les données
    test_data = {"key": "value"}
    
    # Act - Executer l'action à tester
    response = client.post("/api/endpoint", json=test_data)
    
    # Assert - Vérifier le résultat
    assert response.status_code == 200
    assert response.json()["result"] == "expected_value"
```

### Exemple concret : Tester une fonction de calcul

Supposons que vous avez une fonction de calcul d'inertie :

```python
# Dans votre fichier de logique métier
def calculate_inertia(width, height):
    """Calcule l'inertie d'une section rectangulaire"""
    if width <= 0 or height <= 0:
        raise ValueError("Les dimensions doivent être positives")
    
    return (width * height**3) / 12
```

Voici comment la tester :

```python
# Dans tests/test_calculations.py
import pytest
from calculations import calculate_inertia

class TestCalculateInertia:
    """Tests pour la fonction calculate_inertia"""
    
    def test_inertia_basic_calculation(self):
        """Test du calcul d'inertie basique"""
        # Arrange
        width = 10
        height = 20
        expected = (10 * 20**3) / 12  # 6666.67
        
        # Act
        result = calculate_inertia(width, height)
        
        # Assert
        assert abs(result - expected) < 0.01  # Comparaison avec tolérance
    
    def test_inertia_with_zero_width(self):
        """Test avec largeur nulle - doit lever une exception"""
        with pytest.raises(ValueError, match="dimensions doivent être positives"):
            calculate_inertia(0, 10)
    
    def test_inertia_with_negative_height(self):
        """Test avec hauteur négative - doit lever une exception"""
        with pytest.raises(ValueError):
            calculate_inertia(10, -5)
    
    @pytest.mark.parametrize("width,height,expected", [
        (1, 1, 1/12),
        (2, 4, (2 * 4**3) / 12),
        (5, 3, (5 * 3**3) / 12),
    ])
    def test_inertia_multiple_cases(self, width, height, expected):
        """Test avec plusieurs jeux de données"""
        result = calculate_inertia(width, height)
        assert abs(result - expected) < 0.01
```

### Tester les routes API

Exemple simple pour tester la route `/analysis` :

```python
# Dans tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from api import router
from fastapi import FastAPI

@pytest.fixture
def app():
    """Fixture pour créer l'application FastAPI"""
    app = FastAPI()
    app.include_router(router)
    return app

@pytest.fixture
def client(app):
    """Fixture pour créer le client de test"""
    return TestClient(app)

class TestAnalysisRoute:
    """Tests pour la route /analysis"""
    
    def test_analysis_basic_calculation(self, client):
        """Test basique de la route /analysis avec calcul simple"""
        # Arrange - Préparer les données de test
        test_data = {
            "length": {"value": 100},
            "width": {"value": 50}
        }
        
        # Act - Exécuter la requête
        response = client.post("/api/analysis", json=test_data)
        
        # Assert - Vérifier les résultats
        assert response.status_code == 200
        result = response.json()
        assert result["length"]["value"] == 110  # 100 + 10 (logique métier)
        assert result["width"]["value"] == 50  # Inchangé
```

### Lancement des tests

#### Tests de base
```shell
$ python -m pytest tests/ --verbose
```

#### Tests avec couverture de code
```shell
$ python -m pytest tests/ --cov=. --cov-report=term-missing --verbose
```

#### Tests d'un fichier spécifique
```shell
$ python -m pytest tests/test_api.py --verbose
```

#### Tests d'une fonction spécifique
```shell
$ python -m pytest tests/test_api.py::test_analysis_route_success --verbose
```

### Bonnes pratiques

#### 1. Nommage des tests
- Utilisez des noms explicites : `test_calculate_inertia_with_valid_inputs`
- Suivez le pattern : `test_[fonction]_[condition]_[résultat_attendu]`

#### 2. Organisation des tests
- Une classe de test par fonction/module testé
- Grouper les tests par fonctionnalité

#### 3. Structure Arrange-Act-Assert
```python
def test_example():
    # Arrange - Préparer les données
    input_data = {"key": "value"}
    
    # Act - Executer l'action
    result = function_to_test(input_data)
    
    # Assert - Vérifier le résultat
    assert result == expected_value
```

#### 4. Tests des cas limites
Testez toujours :
- ✅ Les cas normaux
- ✅ Les cas limites (valeurs nulles, négatives, très grandes)
- ✅ Les cas d'erreur (exceptions attendues)

#### 5. Fixtures pour la réutilisabilité
```python
@pytest.fixture
def sample_data():
    """Données de test réutilisables"""
    return {
        "width": {"value": 100},
        "height": {"value": 200}
    }

def test_with_fixture(sample_data):
    # Utilise les données de la fixture
    assert sample_data["width"]["value"] == 100
```

### Intégration CI/CD

Les tests sont automatiquement exécutés dans la pipeline GitLab CI/CD :

1. **Installation** des dépendances
2. **Exécution** des tests avec `pytest`
3. **Génération** du rapport de couverture
4. **Échec** du pipeline si les tests ne passent pas

### Débuggage des tests

Pour débugger un test qui échoue :

```shell
# Afficher plus d'informations
$ python -m pytest tests/test_api.py::test_failing_test -v -s

# Arrêter au premier échec
$ python -m pytest tests/ -x

# Entrer en mode debug
$ python -m pytest tests/ --pdb
```

## <a name="api-documentation"></a>API Documentation

La documentation interactive de l'API est disponible sur :
- Swagger UI : `http://localhost:8000/docs`
- ReDoc : `http://localhost:8000/redoc`

## <a name="développement"></a>Développement

### Ajouter une nouvelle route

1. **Définir** la route dans `api.py`
2. **Écrire** les tests dans `tests/test_api.py`
3. **Exécuter** les tests pour vérifier
4. **Documenter** la route avec des docstrings

### Workflow de développement

1. 🔍 **Comprendre** le besoin
2. ✍️ **Écrire** le test (TDD - Test Driven Development)
3. 💻 **Implémenter** la fonctionnalité
4. ✅ **Vérifier** que le test passe
5. 🔄 **Refactoriser** si nécessaire
6. 📝 **Documenter** le code

Cette approche garantit une qualité de code élevée et facilite la maintenance.
