from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mcp import FastApiMCP
from dotenv import load_dotenv
from bson.objectid import ObjectId
import httpx
import pathlib
import os

# Importer le routeur depuis le fichier api.py
from api import router as api_router

app = FastAPI(
    title="SDK Webapp Python",
    description="API pour le SDK Webapp Python",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configurer CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Récupération de la variable d'environnement
env_path = pathlib.Path(__file__).parent.parent / '.env'  # Chemin vers .env.development
load_dotenv(dotenv_path=env_path)  # Charger les variables d'environnement
REACT_APP_PLATFORM_API_URL = os.environ.get("REACT_APP_PLATFORM_API_URL")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
if not REACT_APP_PLATFORM_API_URL:
    raise RuntimeError("REACT_APP_PLATFORM_API_URL non définie dans les variables d'environnement")

# Chemin vers le dossier build de l'application React
build_dir = os.path.join(os.path.dirname(__file__), '../frontend', 'build')

# Inclure le routeur API
app.include_router(api_router)

# En mode développement, rediriger les requêtes frontend vers le serveur React
@app.middleware("http")
async def proxy_middleware(request: Request, call_next):
    if ENVIRONMENT == "development" and not request.url.path.startswith("/api") and not request.url.path.startswith("/mcp"):
        # Vérifier si la requête est destinée au frontend
        if (request.url.path.startswith("/static") or 
            request.url.path == "/" or 
            request.url.path.startswith("/applications")):
            # Rediriger vers le serveur de développement React
            async with httpx.AsyncClient() as client:
                try:
                    url = f"http://localhost:3000{request.url.path}"
                    if request.url.query:
                        url = f"{url}?{request.url.query}"
                    
                    # Copier les en-têtes de la requête
                    headers = dict(request.headers)
                    headers.pop("host", None)
                    # Supprimer les en-têtes de compression qui peuvent causer des problèmes
                    headers.pop("accept-encoding", None)
                    
                    # Rediriger la requête
                    method = request.method
                    if method == "GET":
                        response = await client.get(url, headers=headers, follow_redirects=True)
                    elif method == "POST":
                        body = await request.body()
                        response = await client.post(url, content=body, headers=headers, follow_redirects=True)
                    else:
                        # Méthodes supplémentaires si nécessaire
                        return await call_next(request)
                    
                    # Préparer les en-têtes pour la réponse, en excluant content-encoding
                    response_headers = dict(response.headers)
                    response_headers.pop("content-encoding", None)
                    response_headers.pop("transfer-encoding", None)
                    
                    # Retourner la réponse du serveur React
                    return HTMLResponse(
                        content=response.content,
                        status_code=response.status_code,
                        headers=response_headers
                    )
                except httpx.RequestError as e:
                    # Si le serveur React n'est pas disponible, continuer avec le serveur FastAPI
                    print(f"Erreur de proxy: {e}")
                    pass
    
    # Si ce n'est pas une requête pour le frontend ou si le serveur React n'est pas disponible
    return await call_next(request)

# Serve the static files from the React build directory only in production
if ENVIRONMENT != "development":
    app.mount("/static", StaticFiles(directory=os.path.join(build_dir, 'static')), name="static")
    
    @app.get("/")
    async def read_index():
        return FileResponse(os.path.join(build_dir, 'index.html'))
        
    @app.get("/applications/{applicationId}")
    async def read_application(applicationId: str):
        return FileResponse(os.path.join(build_dir, 'index.html'))
    
    @app.get("/applications/{applicationId}/models/{modelId}")
    async def read_application_model(applicationId: str, modelId: str):
        return FileResponse(os.path.join(build_dir, 'index.html'))

@app.get("/remoteEntry.js")
async def read_remote_entry():
    if ENVIRONMENT != "development":
        return FileResponse(os.path.join(build_dir, 'remoteEntry.js'))
    else:
        # En développement, proxy vers le serveur React
        async with httpx.AsyncClient() as client:
            try:
                url = "http://localhost:3000/remoteEntry.js"
                response = await client.get(url, follow_redirects=True)
                return HTMLResponse(
                    content=response.content,
                    status_code=response.status_code,
                    headers={k: v for k, v in response.headers.items() 
                             if k.lower() not in ("content-encoding", "transfer-encoding")}
                )
            except httpx.RequestError:
                return HTMLResponse(content="Error loading remoteEntry.js", status_code=500)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Note: les routes d'API ont été déplacées vers api.py
# Ajout du MCP serveur directement à FastAPI
mcp = FastApiMCP(
  app,
  name="My API MCP",  # Name for your MCP server
  description="MCP server for my API",  # Description
)
mcp.mount()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)