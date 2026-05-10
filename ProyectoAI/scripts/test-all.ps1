#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Run all tests in all repositories
.DESCRIPTION
    Runs unit + integration tests for core-platform, iam-service, ai-service and market-service.
    Ensures core-platform is installed first.
.EXAMPLE
    .\scripts\test-all.ps1
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Running All Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install core-platform (needed for service tests)
Write-Host "[0/4] Installing core-platform..." -ForegroundColor Yellow
& "$PSScriptRoot\install-core.ps1"
Write-Host ""

# Step 2: Test core-platform
Write-Host "[1/4] Testing core-platform..." -ForegroundColor Yellow
Push-Location "$rootDir\core-plataform"
try {
    & .\mvnw test
    if ($LASTEXITCODE -ne 0) {
        throw "core-platform tests failed"
    }
    Write-Host "✓ core-platform tests passed" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""

# Step 3: Test iam-service
Write-Host "[2/4] Testing iam-service..." -ForegroundColor Yellow
Push-Location "$rootDir\iam-service"
try {
    & .\mvnw test
    if ($LASTEXITCODE -ne 0) {
        throw "iam-service tests failed"
    }
    Write-Host "✓ iam-service tests passed" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""

# Step 4: Test ai-service
Write-Host "[3/4] Testing ai-service..." -ForegroundColor Yellow
Push-Location "$rootDir\ai-service"
try {
    & .\mvnw.cmd test
    if ($LASTEXITCODE -ne 0) {
        throw "ai-service tests failed"
    }
    Write-Host "✓ ai-service tests passed" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""

# Step 5: Test market-service
Write-Host "[4/4] Testing market-service..." -ForegroundColor Yellow
Push-Location "$rootDir\market-service"
try {
    & .\mvnw.cmd test
    if ($LASTEXITCODE -ne 0) {
        throw "market-service tests failed"
    }
    Write-Host "âœ“ market-service tests passed" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ✓ ALL TESTS PASSED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
