#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build all repositories in correct order with dependency resolution
.DESCRIPTION
    Builds core-platform first (install to local Maven repo), then services and frontend.
    This ensures iam-service and ai-service can resolve core-platform dependency and the Vite app compiles.
.PARAMETER SkipTests
    Skip test execution (default: false)
.PARAMETER Clean
    Run clean before build (default: true)
.EXAMPLE
    .\scripts\build-all.ps1
.EXAMPLE
    .\scripts\build-all.ps1 -SkipTests
#>

[CmdletBinding()]
param(
    [switch]$SkipTests = $false,
    [switch]$Clean = $true
)

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Multi-Repo Build Workflow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testFlag = if ($SkipTests) { "-DskipTests" } else { "" }
$cleanPhase = if ($Clean) { "clean" } else { "" }

# Step 1: Build and install core-platform
Write-Host "[1/5] Building core-platform (install to local Maven repo)..." -ForegroundColor Yellow
Push-Location "$rootDir\core-plataform"
try {
    & .\mvnw.cmd $cleanPhase install $testFlag
    if ($LASTEXITCODE -ne 0) {
        throw "core-platform build failed with exit code $LASTEXITCODE"
    }
    Write-Host "OK: core-platform installed successfully" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""

# Step 2: Build iam-service
Write-Host "[2/5] Building iam-service..." -ForegroundColor Yellow
Push-Location "$rootDir\iam-service"
try {
    & .\mvnw.cmd $cleanPhase install $testFlag
    if ($LASTEXITCODE -ne 0) {
        throw "iam-service build failed with exit code $LASTEXITCODE"
    }
    Write-Host "OK: iam-service installed successfully" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""

# Step 3: Build ai-service
Write-Host "[3/5] Building ai-service..." -ForegroundColor Yellow
Push-Location "$rootDir\ai-service"
try {
    & .\mvnw.cmd $cleanPhase install $testFlag
    if ($LASTEXITCODE -ne 0) {
        throw "ai-service build failed with exit code $LASTEXITCODE"
    }
    Write-Host "OK: ai-service installed successfully" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""

# Step 4: Build market-service
Write-Host "[4/5] Building market-service..." -ForegroundColor Yellow
Push-Location "$rootDir\market-service"
try {
    & .\mvnw.cmd $cleanPhase install $testFlag
    if ($LASTEXITCODE -ne 0) {
        throw "market-service build failed with exit code $LASTEXITCODE"
    }
    Write-Host "OK: market-service installed successfully" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""

# Step 5: Build frontend
Write-Host "[5/5] Building frontend..." -ForegroundColor Yellow
Push-Location "$rootDir\frontend"
try {
    if (-not (Test-Path "node_modules")) {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) {
            throw "frontend npm ci failed with exit code $LASTEXITCODE"
        }
    }
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) {
        throw "frontend build failed with exit code $LASTEXITCODE"
    }
    Write-Host "OK: frontend built successfully" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " [OK] ALL BUILDS SUCCESSFUL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
