# PRD Phase Kit installer shim (Windows PowerShell) — runs the Node installer via npx.
#   irm https://raw.githubusercontent.com/ALIFKA-HUB/prd-phase-kit/main/install.ps1 | iex
$ErrorActionPreference = 'Stop'

$repo = 'github:ALIFKA-HUB/prd-phase-kit'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error 'PRD Phase Kit needs Node.js >= 18. Install it from https://nodejs.org and retry.'
  exit 1
}
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Error 'npx not found. Install Node.js (which ships npx) from https://nodejs.org.'
  exit 1
}

npx -y $repo @args