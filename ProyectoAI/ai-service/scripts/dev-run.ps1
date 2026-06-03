# Run script for ai-service in dev profile
# Usage: .\scripts\dev-run.ps1 [-Port 8082]
param(
    [int]$Port = 0
)

Write-Host "Starting ai-service in dev profile..." -ForegroundColor Cyan

function Import-EnvFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return }
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) { return }
        $key, $value = $line -split "=", 2
        if ($key -and -not [Environment]::GetEnvironmentVariable($key, "Process")) {
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

Import-EnvFile (Join-Path (Split-Path -Parent $PSScriptRoot) ".env")
$profile = if ($env:AI_PROFILE) { $env:AI_PROFILE } else { "dev" }

$mvnArgs = @(
    "-f", "modules/ai-bootstrap/pom.xml",
    "-Dspring-boot.run.profiles=$profile"
)

if ($Port -gt 0) {
    Write-Host "Using custom port: $Port" -ForegroundColor Yellow
    $mvnArgs += "-Dspring-boot.run.arguments=--server.port=$Port"
}

$mvnArgs += "spring-boot:run"

.\mvnw.cmd $mvnArgs
