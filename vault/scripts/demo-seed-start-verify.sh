#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

require_var() {
  name="$1"
  eval value="\${$name:-}"
  if [ -z "$value" ]; then
    echo "[vault-demo] missing required env var: $name"
    exit 1
  fi
}

require_var MONGO_ATLAS_URI
require_var JWT_SECRET
require_var JWT_REFRESH_SECRET
require_var SMTP_USER
require_var SMTP_PASS
require_var CLOUDINARY_CLOUD_NAME
require_var CLOUDINARY_API_KEY
require_var CLOUDINARY_API_SECRET
require_var RAZORPAY_KEY_ID
require_var RAZORPAY_KEY_SECRET
require_var GROQ_API_KEY
require_var INTERNAL_SERVICE_SECRET

echo "[vault-demo] starting Vault"
docker compose up -d vault

echo "[vault-demo] seeding required secrets"
docker compose run --rm \
  -e VAULT_ADDR=http://vault:8200 \
  -e VAULT_TOKEN=root \
  -e MONGO_ATLAS_URI="$MONGO_ATLAS_URI" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  -e SMTP_USER="$SMTP_USER" \
  -e SMTP_PASS="$SMTP_PASS" \
  -e SMTP_FROM="${SMTP_FROM:-$SMTP_USER}" \
  -e CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" \
  -e CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY" \
  -e CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET" \
  -e RAZORPAY_KEY_ID="$RAZORPAY_KEY_ID" \
  -e RAZORPAY_KEY_SECRET="$RAZORPAY_KEY_SECRET" \
  -e GROQ_API_KEY="$GROQ_API_KEY" \
  -e INTERNAL_SERVICE_SECRET="$INTERNAL_SERVICE_SECRET" \
  -e GRAFANA_ADMIN_PASSWORD="${GRAFANA_ADMIN_PASSWORD:-admin}" \
  -v ./vault/scripts:/vault/scripts:ro \
  vault sh /vault/scripts/seed-required-secrets.sh

echo "[vault-demo] starting full stack"
docker compose up -d
docker compose --profile monitoring up -d

echo "[vault-demo] verifying Vault-rendered env files"
docker compose exec auth-service sh -c 'test -s /vault/runtime/auth-service.env && echo "auth-service: ok"'
docker compose exec payment-service sh -c 'test -s /vault/runtime/payment-service.env && echo "payment-service: ok"'
docker compose exec event-service sh -c 'test -s /vault/runtime/event-service.env && echo "event-service: ok"'
docker compose exec budget-service sh -c 'test -s /vault/runtime/budget-service.env && echo "budget-service: ok"'
docker compose exec booking-service sh -c 'test -s /vault/runtime/booking-service.env && echo "booking-service: ok"'
docker compose exec notification-service sh -c 'test -s /vault/runtime/notification-service.env && echo "notification-service: ok"'
docker compose exec api-gateway sh -c 'test -s /vault/runtime/api-gateway.env && echo "api-gateway: ok"'

echo "[vault-demo] verifying runtime temp env cleanup"
docker compose exec auth-service sh -c 'test ! -f /tmp/.env.runtime && echo "temp env cleanup: ok"'

echo "[vault-demo] done"
