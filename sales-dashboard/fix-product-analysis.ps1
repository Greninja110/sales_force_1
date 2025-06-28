# PowerShell script to fix the TreeMap import in ProductAnalysis.jsx
# Run this in the root of your sales-dashboard directory

$productAnalysisPath = "frontend/src/pages/ProductAnalysis.jsx"

# Check if the file exists
if (Test-Path $productAnalysisPath) {
    # Read the current file
    $content = Get-Content $productAnalysisPath -Raw
    
    # Replace TreeMap with Treemap (lowercase 'm')
    $fixedContent = $content -replace "TreeMap", "Treemap"
    
    # Save the updated file
    Set-Content -Path $productAnalysisPath -Value $fixedContent
    
    Write-Host "Updated $productAnalysisPath: Fixed TreeMap -> Treemap" -ForegroundColor Green
} else {
    Write-Host "Error: $productAnalysisPath not found!" -ForegroundColor Red
}

Write-Host "Now restart your Docker containers:" -ForegroundColor Yellow
Write-Host "docker-compose down" -ForegroundColor Yellow
Write-Host "docker-compose up -d" -ForegroundColor Yellow