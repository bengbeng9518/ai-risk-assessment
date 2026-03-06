[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Real-time API Usage Log (Ctrl+C to exit) ===" -ForegroundColor Green
Write-Host ""

Get-Content -Path "api-log.txt" -Wait -Tail 0 | ForEach-Object {
    $line = $_

    if ($line -match "AI_ANALYZE_REQUEST") {
        Write-Host "`n[REQUEST] $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
    }
    elseif ($line -match "AI_ANALYZE_RESPONSE") {
        Write-Host "[RESPONSE] $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
    }
    elseif ($line -match '"code":') {
        Write-Host "  ERROR CODE: $line" -ForegroundColor Red
    }
    elseif ($line -match '"message":') {
        Write-Host "  MESSAGE: $line" -ForegroundColor Red
    }
    elseif ($line -match "riskScore|riskLevel|职业名称") {
        Write-Host "  RESULT: $line" -ForegroundColor Yellow
    }
    elseif ($line -match '"model":') {
        Write-Host "  MODEL: $line" -ForegroundColor Magenta
    }
    elseif ($line -match "total_tokens") {
        Write-Host "  TOKENS: $line" -ForegroundColor White
    }
}
