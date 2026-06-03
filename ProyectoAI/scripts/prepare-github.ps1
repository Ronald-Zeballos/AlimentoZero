#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Validate and optionally stage the AlimentoZero source files needed for GitHub.
.DESCRIPTION
    Checks frontend assets, fallback JSON, PowerShell script syntax, Git ignore rules and frontend build.
    With -Stage, stages only source/config/assets that belong in GitHub.
.PARAMETER Stage
    Stage the verified source files with git add.
.PARAMETER SkipBuild
    Skip npm build validation.
.EXAMPLE
    .\scripts\prepare-github.ps1
.EXAMPLE
    .\scripts\prepare-github.ps1 -Stage
#>

[CmdletBinding()]
param(
    [switch]$Stage = $false,
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $PSScriptRoot
$repoTop = (& git -C $rootDir rev-parse --show-toplevel).Trim()

function Assert-File {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        throw "Required file missing: $Path"
    }
}

function Assert-NotIgnored {
    param([string]$Path)
    & git -C $rootDir check-ignore -q -- $Path
    if ($LASTEXITCODE -eq 0) {
        throw "Required file is ignored by git: $Path"
    }
}

function Test-PowerShellSyntax {
    param([string]$Path)
    $tokens = $null
    $errors = $null
    [System.Management.Automation.Language.Parser]::ParseFile($Path, [ref]$tokens, [ref]$errors) | Out-Null
    if ($errors) {
        $message = ($errors | ForEach-Object { $_.Message }) -join "; "
        throw "PowerShell syntax error in ${Path}: $message"
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " GitHub readiness check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$assetDir = Join-Path $rootDir "frontend\public\assets\orders"
$assets = @(
    "pizza-margherita.jpg",
    "pasta-alfredo.jpg",
    "ensalada-cesar.jpg",
    "tiramisu.jpg",
    "sopa-dia.jpg",
    "pan-artesanal.jpg"
)

Write-Host "[1/5] Checking frontend assets..." -ForegroundColor Yellow
foreach ($asset in $assets) {
    $path = Join-Path $assetDir $asset
    Assert-File $path
    $item = Get-Item $path
    if ($item.Length -le 0) { throw "Asset is empty: $path" }
    Assert-NotIgnored $path
}
Write-Host "OK: public image assets are present and not ignored" -ForegroundColor Green

Write-Host "[2/5] Checking assistant fallback JSON..." -ForegroundColor Yellow
$fallbackPath = Join-Path $rootDir "frontend\public\assistant-fallback.json"
Assert-File $fallbackPath
Assert-NotIgnored $fallbackPath
$fallback = Get-Content $fallbackPath -Raw | ConvertFrom-Json
if (-not $fallback -or $fallback.Count -lt 1) {
    throw "assistant-fallback.json must contain at least one Q&A entry"
}
Write-Host "OK: assistant fallback JSON is valid" -ForegroundColor Green

Write-Host "[3/5] Checking script syntax..." -ForegroundColor Yellow
$scripts = @("build-all.ps1", "test-all.ps1", "run-all.ps1", "stop-all.ps1", "prepare-github.ps1")
foreach ($script in $scripts) {
    Test-PowerShellSyntax (Join-Path $PSScriptRoot $script)
}
Write-Host "OK: scripts parse correctly" -ForegroundColor Green

if (-not $SkipBuild) {
    Write-Host "[4/5] Building frontend..." -ForegroundColor Yellow
    Push-Location (Join-Path $rootDir "frontend")
    try {
        if (-not (Test-Path "node_modules")) {
            & npm.cmd ci
            if ($LASTEXITCODE -ne 0) { throw "npm ci failed" }
        }
        & npm.cmd run build
        if ($LASTEXITCODE -ne 0) { throw "frontend build failed" }
    } finally {
        Pop-Location
    }
    Write-Host "OK: frontend build passes" -ForegroundColor Green
} else {
    Write-Host "[4/5] Frontend build skipped" -ForegroundColor Gray
}

Write-Host "[5/5] Checking files that should stay local..." -ForegroundColor Yellow
$localOnly = @(
    (Join-Path $rootDir "ai-service\.env"),
    (Join-Path $rootDir "frontend\node_modules"),
    (Join-Path $rootDir "frontend\dist")
)
foreach ($path in $localOnly) {
    if (Test-Path $path) {
        & git -C $rootDir check-ignore -q -- $path
        if ($LASTEXITCODE -ne 0) {
            Write-Host "WARNING: local-only path is not ignored: $path" -ForegroundColor Yellow
        }
    }
}
Write-Host "OK: local-only check complete" -ForegroundColor Green

if ($Stage) {
    Write-Host "Staging source files for GitHub..." -ForegroundColor Yellow
    $stagePaths = @(
        (Join-Path $repoTop ".gitignore"),
        (Join-Path $rootDir "frontend\index.html"),
        (Join-Path $rootDir "frontend\package.json"),
        (Join-Path $rootDir "frontend\package-lock.json"),
        (Join-Path $rootDir "frontend\vite.config.js"),
        (Join-Path $rootDir "frontend\src"),
        (Join-Path $rootDir "frontend\public"),
        (Join-Path $rootDir "scripts\build-all.ps1"),
        (Join-Path $rootDir "scripts\test-all.ps1"),
        (Join-Path $rootDir "scripts\run-all.ps1"),
        (Join-Path $rootDir "scripts\stop-all.ps1"),
        (Join-Path $rootDir "scripts\prepare-github.ps1"),
        (Join-Path $rootDir "ai-service\.env.example"),
        (Join-Path $rootDir "ai-service\modules\ai-bootstrap\src\main\resources\application-openai.yml"),
        (Join-Path $rootDir "ai-service\modules\ai-infrastructure\src\main\java\com\solveria\ai\infrastructure\llm\openai")
    ) | Where-Object { Test-Path $_ }

    & git -C $rootDir add -- $stagePaths
    if ($LASTEXITCODE -ne 0) { throw "git add failed" }
    Write-Host "OK: selected files staged" -ForegroundColor Green
    & git -C $rootDir status --short -- $stagePaths
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " [OK] Ready for GitHub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
