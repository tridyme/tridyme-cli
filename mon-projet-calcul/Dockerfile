FROM python:3.12-slim
WORKDIR /app
COPY .env ./
WORKDIR /app/frontend/build
COPY frontend/build ./
RUN ls -al /app/frontend/build && ls -al /app/frontend/build/static
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend/ .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]