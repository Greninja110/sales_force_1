# PowerShell script to create the Sales Dashboard project structure
# Run this script in the directory where you want to create the project

# Create the main project directory
$projectName = "sales-dashboard"
New-Item -Path $projectName -ItemType Directory -Force
Set-Location -Path $projectName

# Create backend structure
New-Item -Path "backend/app" -ItemType Directory -Force
New-Item -Path "backend/app/models" -ItemType Directory -Force
New-Item -Path "backend/app/routers" -ItemType Directory -Force
New-Item -Path "backend/app/services" -ItemType Directory -Force
New-Item -Path "backend/app/utils" -ItemType Directory -Force
New-Item -Path "backend/app/logs" -ItemType Directory -Force

# Create backend files
New-Item -Path "backend/app/__init__.py" -ItemType File -Force
New-Item -Path "backend/app/main.py" -ItemType File -Force
New-Item -Path "backend/app/database.py" -ItemType File -Force
New-Item -Path "backend/app/config.py" -ItemType File -Force

New-Item -Path "backend/app/models/__init__.py" -ItemType File -Force
New-Item -Path "backend/app/models/schemas.py" -ItemType File -Force

New-Item -Path "backend/app/routers/__init__.py" -ItemType File -Force
New-Item -Path "backend/app/routers/sales.py" -ItemType File -Force
New-Item -Path "backend/app/routers/forecasts.py" -ItemType File -Force

New-Item -Path "backend/app/services/__init__.py" -ItemType File -Force
New-Item -Path "backend/app/services/data_service.py" -ItemType File -Force
New-Item -Path "backend/app/services/forecast_service.py" -ItemType File -Force

New-Item -Path "backend/app/utils/__init__.py" -ItemType File -Force
New-Item -Path "backend/app/utils/logger.py" -ItemType File -Force
New-Item -Path "backend/app/utils/helpers.py" -ItemType File -Force

New-Item -Path "backend/requirements.txt" -ItemType File -Force
New-Item -Path "backend/README.md" -ItemType File -Force

# Create frontend structure
New-Item -Path "frontend/public" -ItemType Directory -Force
New-Item -Path "frontend/src" -ItemType Directory -Force
New-Item -Path "frontend/src/components/charts" -ItemType Directory -Force
New-Item -Path "frontend/src/components/layout" -ItemType Directory -Force
New-Item -Path "frontend/src/components/dashboard" -ItemType Directory -Force
New-Item -Path "frontend/src/components/common" -ItemType Directory -Force
New-Item -Path "frontend/src/pages" -ItemType Directory -Force
New-Item -Path "frontend/src/services" -ItemType Directory -Force
New-Item -Path "frontend/src/utils" -ItemType Directory -Force

# Create frontend files
New-Item -Path "frontend/public/index.html" -ItemType File -Force
New-Item -Path "frontend/public/favicon.ico" -ItemType File -Force

New-Item -Path "frontend/src/components/charts/SalesChart.jsx" -ItemType File -Force
New-Item -Path "frontend/src/components/charts/RegionalMap.jsx" -ItemType File -Force
New-Item -Path "frontend/src/components/charts/ForecastChart.jsx" -ItemType File -Force
New-Item -Path "frontend/src/components/charts/CategoryBreakdown.jsx" -ItemType File -Force

New-Item -Path "frontend/src/components/layout/Navbar.jsx" -ItemType File -Force
New-Item -Path "frontend/src/components/layout/Sidebar.jsx" -ItemType File -Force
New-Item -Path "frontend/src/components/layout/Footer.jsx" -ItemType File -Force

New-Item -Path "frontend/src/components/dashboard/KPICard.jsx" -ItemType File -Force
New-Item -Path "frontend/src/components/dashboard/FilterPanel.jsx" -ItemType File -Force
New-Item -Path "frontend/src/components/dashboard/StatCard.jsx" -ItemType File -Force

New-Item -Path "frontend/src/components/common/Button.jsx" -ItemType File -Force
New-Item -Path "frontend/src/components/common/Dropdown.jsx" -ItemType File -Force
New-Item -Path "frontend/src/components/common/DateRangePicker.jsx" -ItemType File -Force

New-Item -Path "frontend/src/pages/Dashboard.jsx" -ItemType File -Force
New-Item -Path "frontend/src/pages/SalesAnalysis.jsx" -ItemType File -Force
New-Item -Path "frontend/src/pages/RegionalAnalysis.jsx" -ItemType File -Force
New-Item -Path "frontend/src/pages/ProductAnalysis.jsx" -ItemType File -Force
New-Item -Path "frontend/src/pages/Forecasting.jsx" -ItemType File -Force

New-Item -Path "frontend/src/services/api.js" -ItemType File -Force
New-Item -Path "frontend/src/services/dataService.js" -ItemType File -Force

New-Item -Path "frontend/src/utils/dateUtils.js" -ItemType File -Force
New-Item -Path "frontend/src/utils/formatters.js" -ItemType File -Force

New-Item -Path "frontend/src/App.jsx" -ItemType File -Force
New-Item -Path "frontend/src/index.jsx" -ItemType File -Force
New-Item -Path "frontend/src/index.css" -ItemType File -Force

New-Item -Path "frontend/package.json" -ItemType File -Force
New-Item -Path "frontend/tailwind.config.js" -ItemType File -Force
New-Item -Path "frontend/README.md" -ItemType File -Force

# Create data directory
New-Item -Path "data" -ItemType Directory -Force
# Note: You'll need to manually download the superstore.csv file

# Create root files
New-Item -Path "Dockerfile" -ItemType File -Force
New-Item -Path "docker-compose.yml" -ItemType File -Force
New-Item -Path "README.md" -ItemType File -Force

Write-Host "Project directory structure created successfully at: $((Get-Location).Path)" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Download the Superstore dataset and place it in the data folder as superstore.csv" -ForegroundColor Yellow
Write-Host "2. Open the project in VS Code" -ForegroundColor Yellow
Write-Host "3. Copy the code for each file provided earlier" -ForegroundColor Yellow

# Open project in VS Code
code .