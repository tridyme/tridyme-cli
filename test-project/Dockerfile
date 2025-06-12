# Dockerfile pour les applications TriDyme
# Ce fichier doit être placé à la racine des projets TriDyme

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de dépendances
COPY frontend/package*.json ./
COPY frontend/module-federation/package*.json ./module-federation/

# Installer les dépendances
RUN npm ci --only=production

# Copier module-federation et installer ses dépendances
COPY frontend/module-federation ./module-federation
RUN cd module-federation && npm ci --only=production

# Copier le code source frontend
COPY frontend .

# Variables d'environnement pour le build
ARG REACT_APP_ENVIRONMENT=production
ARG REACT_APP_LOGO="./logo.svg"
ARG REACT_APP_COMPANY="TriDyme"
ARG REACT_APP_APPLICATION_NAME="TriDyme App"
ARG REACT_APP_APPLICATION_API_URL
ARG REACT_APP_PLATFORM_API_URL
ARG REACT_APP_PLATFORM_API_TOKEN
ARG REACT_APP_APPLICATION_ID

ENV REACT_APP_ENVIRONMENT=$REACT_APP_ENVIRONMENT
ENV REACT_APP_LOGO=$REACT_APP_LOGO
ENV REACT_APP_COMPANY=$REACT_APP_COMPANY
ENV REACT_APP_APPLICATION_NAME=$REACT_APP_APPLICATION_NAME
ENV REACT_APP_APPLICATION_API_URL=$REACT_APP_APPLICATION_API_URL
ENV REACT_APP_PLATFORM_API_URL=$REACT_APP_PLATFORM_API_URL
ENV REACT_APP_PLATFORM_API_TOKEN=$REACT_APP_PLATFORM_API_TOKEN
ENV REACT_APP_APPLICATION_ID=$REACT_APP_APPLICATION_ID
ENV NODE_PATH=./..
ENV CI=false

# Construire l'application
RUN npm run build

# Stage 2: Setup Python backend
FROM python:3.11-slim AS backend-setup

WORKDIR /app

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copier les requirements
COPY backend/requirements.txt ./backend/

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Stage 3: Production image
FROM python:3.11-slim AS production

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root
RUN groupadd -r tridyme && useradd -r -g tridyme tridyme

WORKDIR /app

# Copier les dépendances Python depuis l'étape précédente
COPY --from=backend-setup /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-setup /usr/local/bin /usr/local/bin

# Copier le backend
COPY backend ./backend

# Copier le frontend buildé
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Copier les fichiers de configuration
COPY .env* ./

# Créer les dossiers nécessaires
RUN mkdir -p logs tmp && \
    chown -R tridyme:tridyme /app

# Changer vers l'utilisateur non-root
USER tridyme

# Variables d'environnement
ENV PYTHONPATH=/app/backend
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV ENVIRONMENT=production

# Exposer le port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Point d'entrée
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]