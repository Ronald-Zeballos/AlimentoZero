#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Stop all AlimentoZero services and optional Docker containers
.DESCRIPTION
    Kills java/node processes on known ports (8080, 8091, 8092, 5173)
    and optionally stops docker-compose for ai-service.
.PARAMETER Docker
    Also stop docker-compose containers (default: true)
.PARAMETER NoDocker
    Skip docker-compose down
.EXAMPLE
    .\scripts\stop-all.ps1
.EXAMPLE
    .\scripts\stop-all.ps1 -NoDocker
#>

[CmdletBinding()]
param(
    [switch]$NoDocker = $false
)

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $PSScriptRoot

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  AlimentoZero - Stop All Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Kill processes by port
$ports = @{8080="IAM Service"; 8091="AI Service"; 8092="Market Service"; 5173="Frontend"}
foreach ($port in $ports.Keys) {
    $conn = netstat -ano | Select-String "LISTENING" | Select-String ":$port "
    if ($conn) {
        $procId = ($conn -split '\s+')[-1]
        Write-Host "[$($ports[$port])] Stopping PID $procId (port $port)..." -ForegroundColor Yellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Write-Host "[$($ports[$port])] Stopped" -ForegroundColor Green
    } else {
        Write-Host "[$($ports[$port])] Not running" -ForegroundColor Gray
    }
}

# Kill any remaining java.exe from our services (safety net)
Get-Process java -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -like "*Service*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

if (-not $NoDocker) {
    $dockerCompose = Join-Path $rootDir "ai-service\docker-compose.yml"
    if (Test-Path $dockerCompose) {
        Write-Host "[Docker] Stopping ai-service containers..." -ForegroundColor Yellow
        Push-Location (Split-Path -Parent $dockerCompose)
        try {
            $oldErrorActionPreference = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            $output = & docker-compose down 2>&1
            $exitCode = $LASTEXITCODE
            $ErrorActionPreference = $oldErrorActionPreference

            if ($output) {
                $output | ForEach-Object {
                    $line = if ($_ -is [System.Management.Automation.ErrorRecord]) { $_.Exception.Message } else { $_.ToString() }
                    if ($line) { Write-Host "[Docker] $line" -ForegroundColor Gray }
                }
            }

            if ($exitCode -eq 0) {
                Write-Host "[Docker] Containers stopped" -ForegroundColor Green
            } else {
                Write-Host "[Docker] WARNING: docker-compose down exited with code $exitCode" -ForegroundColor Yellow
            }
        } finally {
            Pop-Location
        }
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  [OK] All services stopped" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
