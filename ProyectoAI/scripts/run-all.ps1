#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Start all AlimentoZero services in separate terminal windows
.DESCRIPTION
    Launches 4 services in order: iam-service, ai-service, market-service, frontend.
    Each runs in its own terminal window for independent monitoring.
    Optionally starts Docker containers (ai-service postgres) before services.
.PARAMETER NoBuild
    Skip build step before starting (default: false, builds first)
.PARAMETER NoFrontend
    Skip frontend (default: false)
.PARAMETER NoDocker
    Skip Docker infrastructure (default: false, starts docker-compose)
.PARAMETER FrontendMode
    Frontend to launch: vite, react, or none (default: vite)
.EXAMPLE
    .\scripts\run-all.ps1
.EXAMPLE
    .\scripts\run-all.ps1 -NoBuild -NoFrontend
.EXAMPLE
    .\scripts\run-all.ps1 -NoDocker
#>

[CmdletBinding()]
param(
    [switch]$NoBuild = $false,
    [switch]$NoFrontend = $false,
    [switch]$NoDocker = $false,
    [ValidateSet("vite", "react", "none")]
    [string]$FrontendMode = "vite"
)

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $PSScriptRoot
$startTime = Get-Date

function Import-EnvFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return }
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) { return }
        $key, $value = $line -split "=", 2
        $key = $key.Trim()
        $value = $value.Trim().Trim('"').Trim("'")
        if ($key -and -not [Environment]::GetEnvironmentVariable($key, "Process")) {
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

function Start-ServiceWindow {
    param([string]$Title, [string]$Dir, [string]$Command, [int]$Delay = 0)
    $workDir = Join-Path $rootDir $Dir
    Write-Host "[$Title] Starting..." -ForegroundColor Yellow
    Start-Process -WindowStyle Normal -FilePath "cmd.exe" -ArgumentList @("/k", $Command) -WorkingDirectory $workDir
    if ($Delay -gt 0) { Start-Sleep -Seconds $Delay }
    Write-Host "[$Title] OK" -ForegroundColor Green
}

function Start-DockerInfra {
    param([string]$Title, [string]$ComposeDir, [int]$WaitSeconds = 15)
    $composeFile = Join-Path (Join-Path $rootDir $ComposeDir) "docker-compose.yml"
    if (-not (Test-Path $composeFile)) {
        Write-Host "[$Title] No docker-compose.yml found, skipping" -ForegroundColor Gray
        return
    }
    Write-Host "[$Title] Starting Docker containers..." -ForegroundColor Yellow
    Push-Location (Join-Path $rootDir $ComposeDir)
    try {
        $oldErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        $output = & docker-compose up -d 2>&1
        $exitCode = $LASTEXITCODE
        $ErrorActionPreference = $oldErrorActionPreference

        if ($output) {
            $output | ForEach-Object {
                $line = if ($_ -is [System.Management.Automation.ErrorRecord]) { $_.Exception.Message } else { $_.ToString() }
                if ($line) { Write-Host "[$Title] $line" -ForegroundColor Gray }
            }
        }

        if ($exitCode -ne 0) {
            Write-Host "[$Title] WARNING: Docker not available (exit code $exitCode)" -ForegroundColor Red
            Write-Host "[$Title] Continuing without Docker. PostgreSQL must be started manually if needed." -ForegroundColor Yellow
            return
        }
        Write-Host "[$Title] Docker containers starting, waiting $WaitSeconds seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds $WaitSeconds
        Write-Host "[$Title] Docker OK" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  AlimentoZero Market - Run All Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Import-EnvFile (Join-Path $rootDir ".env")
Import-EnvFile (Join-Path $rootDir "ai-service\.env")
$aiProfile = if ($env:OPENAI_API_KEY -and (-not $env:AI_PROFILE -or $env:AI_PROFILE -eq "demo")) { "openai" } elseif ($env:AI_PROFILE) { $env:AI_PROFILE } else { "demo" }
Write-Host "[AI] Profile: $aiProfile" -ForegroundColor Cyan
if ($env:OPENAI_API_KEY -and $env:AI_PROFILE -eq "demo") {
    Write-Host "[AI] OPENAI_API_KEY is present; overriding AI_PROFILE=demo and using openai." -ForegroundColor Yellow
}

if (-not $NoBuild) {
    Write-Host "[BUILD] Building all projects first..." -ForegroundColor Magenta
    & "$PSScriptRoot\build-all.ps1"
    if ($LASTEXITCODE -ne 0) { throw "Build failed. Aborting." }
    Write-Host "[BUILD] Build complete" -ForegroundColor Green
    Write-Host ""
}

if (-not $NoDocker) {
    Start-DockerInfra -Title "Docker" -ComposeDir "ai-service" -WaitSeconds 15
    Write-Host ""
}

Write-Host "Launching services (one terminal each)..." -ForegroundColor Cyan
Write-Host ""

# Order: iam-service (8080) -> ai-service (8091) -> market-service (8092) -> frontend (5173)
Start-ServiceWindow -Title "IAM Service (8080)" -Dir "iam-service" -Command ".\mvnw.cmd spring-boot:run `"-Dspring-boot.run.profiles=dev`"" -Delay 3

Start-ServiceWindow -Title "AI Service (8091)" -Dir "ai-service" -Command ".\mvnw.cmd -f modules\ai-bootstrap\pom.xml spring-boot:run `"-Dspring-boot.run.profiles=$aiProfile`"" -Delay 3

Start-ServiceWindow -Title "Market Service (8092)" -Dir "market-service\modules\market-bootstrap" -Command "..\..\mvnw.cmd spring-boot:run `"-Dspring-boot.run.profiles=dev`"" -Delay 3

if (-not $NoFrontend -and $FrontendMode -ne "none") {
    if ($FrontendMode -eq "vite") {
        Start-ServiceWindow -Title "Frontend Vite (5173)" -Dir "frontend" -Command "npm.cmd run dev" -Delay 0
    } elseif ($FrontendMode -eq "react") {
        Start-ServiceWindow -Title "Frontend React Legacy (5173)" -Dir "market-web-react" -Command "npm.cmd run dev" -Delay 0
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  All services launching in separate windows" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  IAM Service  -> http://localhost:8080" -ForegroundColor White
Write-Host "  AI Service   -> http://localhost:8091" -ForegroundColor White
Write-Host "  Market       -> http://localhost:8092" -ForegroundColor White
if (-not $NoFrontend -and $FrontendMode -ne "none") {
    Write-Host "  Frontend     -> http://localhost:5173" -ForegroundColor White
} else {
    Write-Host "  Frontend     -> skipped" -ForegroundColor Gray
}
Write-Host ""
Write-Host "  Use .\scripts\stop-all.ps1 to stop all services." -ForegroundColor Gray
Write-Host "  Total time: $([math]::Round(((Get-Date) - $startTime).TotalSeconds, 1))s" -ForegroundColor Gray
