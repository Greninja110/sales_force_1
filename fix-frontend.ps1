# PowerShell script to fix React import issues
# Run this in the root of your sales-dashboard directory

# Update index.jsx to remove duplicate React import
$indexJsxPath = "frontend/src/index.jsx"

# Check if the file exists
if (Test-Path $indexJsxPath) {
    # Create a fixed version of index.jsx
    $fixedIndexJsx = @"
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <Router>
    <App />
  </Router>
);
"@
    
    # Save the updated file
    Set-Content -Path $indexJsxPath -Value $fixedIndexJsx

    Write-Host "Updated $indexJsxPath to fix duplicate React import" -ForegroundColor Green
} else {
    Write-Host "Error: $indexJsxPath not found!" -ForegroundColor Red
}

Write-Host "Now restart your Docker containers:" -ForegroundColor Yellow
Write-Host "docker-compose down" -ForegroundColor Yellow
Write-Host "docker-compose up -d" -ForegroundColor Yellow