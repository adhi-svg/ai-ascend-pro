# Test Google Login Endpoint
Write-Host "Testing Google Login Endpoint..." -ForegroundColor Cyan

try {
    $uri = "http://localhost:8000/api/v1/auth/google/login"
    Write-Host "`nCalling: $uri" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction Stop
    
    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "`nResponse:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5
    
    if ($response.success -eq $true -and $response.data.auth_url) {
        Write-Host "`n✅ auth_url is present in response" -ForegroundColor Green
        Write-Host "`nGoogle OAuth URL:" -ForegroundColor Cyan
        Write-Host $response.data.auth_url.Substring(0, 100) + "..." -ForegroundColor White
    } else {
        Write-Host "`n❌ auth_url is missing from response" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*Unable to connect*") {
        Write-Host "`nBackend server might not be running." -ForegroundColor Yellow
        Write-Host "Start it with: cd backend; uvicorn app.main:app --reload" -ForegroundColor Yellow
    }
}

Write-Host "`n" -NoNewline
