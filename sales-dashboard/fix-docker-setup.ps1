# PowerShell script to fix Docker setup for the Sales Dashboard project
# Run this in the root of your sales-dashboard directory

# Create backend Dockerfile
$backendDockerfile = @"
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create log directory
RUN mkdir -p app/logs

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
"@

# Create frontend Dockerfile
$frontendDockerfile = @"
FROM node:20-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend application
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
"@

# Create docker-compose.yml
$dockerCompose = @"
version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./data:/app/data
    environment:
      - ENVIRONMENT=development
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    restart: unless-stopped
"@

# Remove any existing root Dockerfile (it should be in the backend and frontend directories instead)
if (Test-Path "Dockerfile") {
    Remove-Item "Dockerfile" -Force
    Write-Host "Removed incorrect root Dockerfile" -ForegroundColor Yellow
}

# Create backend Dockerfile
Set-Content -Path "backend/Dockerfile" -Value $backendDockerfile
Write-Host "Created backend/Dockerfile" -ForegroundColor Green

# Create frontend Dockerfile
Set-Content -Path "frontend/Dockerfile" -Value $frontendDockerfile
Write-Host "Created frontend/Dockerfile" -ForegroundColor Green

# Create docker-compose.yml
Set-Content -Path "docker-compose.yml" -Value $dockerCompose
Write-Host "Created docker-compose.yml" -ForegroundColor Green

Write-Host "Docker setup fixed successfully!" -ForegroundColor Green
Write-Host "You can now run 'docker-compose up -d' to start the application." -ForegroundColor Green