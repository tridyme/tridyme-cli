import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api import router


@pytest.fixture
def app():
    """Fixture pour créer l'application FastAPI avec le routeur API"""
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


class TestHealthRoutes:
    """Tests pour les routes de santé"""
    
    def test_health_endpoint(self, client):
        """Test du endpoint de santé"""
        response = client.get("/api/health")
        
        assert response.status_code == 200
        result = response.json()
        assert result["status"] == "healthy"
        assert "timestamp" in result
        assert "version" in result
    
    def test_ready_endpoint(self, client):
        """Test du endpoint de disponibilité"""
        response = client.get("/api/ready")
        
        assert response.status_code == 200
        result = response.json()
        assert result["status"] == "ready"
        assert "timestamp" in result


class TestErrorHandling:
    """Tests pour la gestion d'erreurs"""
    
    def test_invalid_json(self, client):
        """Test avec JSON invalide"""
        response = client.post(
            "/api/analysis", 
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422  # FastAPI validation error
    
    def test_missing_body(self, client):
        """Test sans body"""
        response = client.post("/api/analysis")
        
        assert response.status_code == 422  # FastAPI validation error