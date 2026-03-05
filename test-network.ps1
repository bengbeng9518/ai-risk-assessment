try {
    $response = Invoke-WebRequest -Uri "https://github.com" -Method Head -TimeoutSec 10 -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)"
} catch {
    Write-Host "Error: $_"
}