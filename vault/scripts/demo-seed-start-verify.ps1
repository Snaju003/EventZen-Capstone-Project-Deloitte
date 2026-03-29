Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Path $PSScriptRoot -Parent | Split-Path -Parent
Set-Location $rootDir

if (Test-Path ".env") {
  Get-Content ".env" | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $parts = $line.Split("=", 2)
    if ($parts.Count -eq 2) {
      [Environment]::SetEnvironmentVariable($parts[0], $parts[1], "Process")
    }
  }
}

$requiredVars = @(
  "MONGO_ATLAS_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "SMTP_USER",
  "SMTP_PASS",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "GROQ_API_KEY",
  "INTERNAL_SERVICE_SECRET"
)

foreach ($name in $requiredVars) {
  if ([string]::IsNullOrWhiteSpace((Get-Item -Path "Env:$name" -ErrorAction SilentlyContinue).Value)) {
    throw "[vault-demo] missing required env var: $name"
  }
}

Write-Host "[vault-demo] starting Vault"
docker compose up -d vault

Write-Host "[vault-demo] seeding required secrets"
$smtpFrom = if ($env:SMTP_FROM) { $env:SMTP_FROM } else { $env:SMTP_USER }
$grafanaPassword = if ($env:GRAFANA_ADMIN_PASSWORD) { $env:GRAFANA_ADMIN_PASSWORD } else { "admin" }

docker compose run --rm `
  -e VAULT_ADDR=http://vault:8200 `
  -e VAULT_TOKEN=root `
  -e MONGO_ATLAS_URI="$env:MONGO_ATLAS_URI" `
  -e JWT_SECRET="$env:JWT_SECRET" `
  -e JWT_REFRESH_SECRET="$env:JWT_REFRESH_SECRET" `
  -e SMTP_USER="$env:SMTP_USER" `
  -e SMTP_PASS="$env:SMTP_PASS" `
  -e SMTP_FROM="$smtpFrom" `
  -e CLOUDINARY_CLOUD_NAME="$env:CLOUDINARY_CLOUD_NAME" `
  -e CLOUDINARY_API_KEY="$env:CLOUDINARY_API_KEY" `
  -e CLOUDINARY_API_SECRET="$env:CLOUDINARY_API_SECRET" `
  -e RAZORPAY_KEY_ID="$env:RAZORPAY_KEY_ID" `
  -e RAZORPAY_KEY_SECRET="$env:RAZORPAY_KEY_SECRET" `
  -e GROQ_API_KEY="$env:GROQ_API_KEY" `
  -e INTERNAL_SERVICE_SECRET="$env:INTERNAL_SERVICE_SECRET" `
  -e GRAFANA_ADMIN_PASSWORD="$grafanaPassword" `
  -v ./vault/scripts:/vault/scripts:ro `
  vault sh /vault/scripts/seed-required-secrets.sh

Write-Host "[vault-demo] starting full stack"
docker compose up -d
docker compose --profile monitoring up -d

Write-Host "[vault-demo] verifying Vault-rendered env files"
docker compose exec auth-service sh -c 'test -s /vault/runtime/auth-service.env && echo "auth-service: ok"'
docker compose exec payment-service sh -c 'test -s /vault/runtime/payment-service.env && echo "payment-service: ok"'
docker compose exec event-service sh -c 'test -s /vault/runtime/event-service.env && echo "event-service: ok"'
docker compose exec budget-service sh -c 'test -s /vault/runtime/budget-service.env && echo "budget-service: ok"'
docker compose exec booking-service sh -c 'test -s /vault/runtime/booking-service.env && echo "booking-service: ok"'
docker compose exec notification-service sh -c 'test -s /vault/runtime/notification-service.env && echo "notification-service: ok"'
docker compose exec api-gateway sh -c 'test -s /vault/runtime/api-gateway.env && echo "api-gateway: ok"'

Write-Host "[vault-demo] verifying runtime temp env cleanup"
docker compose exec auth-service sh -c 'test ! -f /tmp/.env.runtime && echo "temp env cleanup: ok"'

Write-Host "[vault-demo] done"
