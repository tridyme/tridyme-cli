from fastapi import APIRouter, HTTPException, Body
from functools import wraps
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import os

# Modèles Pydantic pour la documentation Swagger
class AnalysisData(BaseModel):
    """
    Modèle pour les données d'analyse
    """
    data: Optional[Dict[str, Any]] = Field(
        None, 
        description="Données d'analyse optionnelles", 
        example={
            "length": {"value": 100},
            "width": {"value": 50},
            "height": {"value": 25}
        }
    )
    
    class Config:
        extra = "allow"  # Permet d'accepter des champs supplémentaires

class AnalysisInput(BaseModel):
    """
    Modèle pour l'entrée JSON de l'analyse
    """
    # Accepte n'importe quelle structure JSON
    class Config:
        extra = "allow"
        schema_extra = {
            "example": {
                "length": {"value": 100},
                "width": {"value": 50},
                "height": {"value": 25}
            }
        }

def handle_exceptions(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except KeyError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Données invalides : {str(e)}"
            )
        except ValueError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Valeur invalide : {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Une erreur interne s'est produite : {str(e)}"
            )
    return wrapper

# Création d'un routeur API
router = APIRouter(prefix="/api", tags=["API"])

# Route pour analyser l'état
@router.post(
    "/analysis", 
    operation_id="post_analysis",
    summary="Analyse des données",
    description="Endpoint pour analyser des données JSON personnalisées et retourner les résultats calculés",
    response_description="Résultats de l'analyse avec les calculs mis à jour"
)
@handle_exceptions
async def analyze_state(input_data: Dict[str, Any] = Body(
    ...,
    description="Données JSON d'entrée pour l'analyse",
    example={
        "length": {"value": 100},
        "width": {"value": 50},
        "height": {"value": 25}
    }
)):
    """
    Analyse les données JSON fournies et retourne les résultats calculés.
    
    - **input_data**: Structure JSON flexible contenant les données à analyser
    - Retourne les données avec les calculs mis à jour
    """
    # La clé 'data' peut être présente ou non, gérons les deux cas
    if 'data' in input_data:
        data = input_data['data']
    else:
        data = input_data
    
    # Appeler la fonction de calcul avec les données
    if 'length' in data and 'value' in data['length']:
        data['length']['value'] += 10
    
    return data

@router.get("/health")
async def health_check():
    """Endpoint de vérification de santé pour Kubernetes"""
    return {
        "status": "healthy",
        "timestamp": "2025-01-15T10:00:00Z",
        "version": "1.0.0"
    }

@router.get("/ready")
async def readiness_check():
    """Endpoint de vérification de disponibilité pour Kubernetes"""
    # Vous pouvez ajouter ici des vérifications de base de données, etc.
    return {
        "status": "ready",
        "timestamp": "2025-01-15T10:00:00Z"
    }