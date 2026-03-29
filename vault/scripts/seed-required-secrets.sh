#!/bin/sh
set -eu

echo "[vault-seed] waiting for Vault API"
until vault status >/dev/null 2>&1; do
  sleep 1
done

echo "[vault-seed] ensuring KV v2 engine at secret/"
vault secrets enable -path=secret kv-v2 >/dev/null 2>&1 || true

required_env() {
  name="$1"
  eval value="\${$name:-}"
  if [ -z "$value" ]; then
    echo "[vault-seed] missing required environment variable: $name"
    exit 1
  fi
}

required_env MONGO_ATLAS_URI
required_env JWT_SECRET
required_env JWT_REFRESH_SECRET
required_env SMTP_USER
required_env SMTP_PASS
required_env CLOUDINARY_CLOUD_NAME
required_env CLOUDINARY_API_KEY
required_env CLOUDINARY_API_SECRET
required_env RAZORPAY_KEY_ID
required_env RAZORPAY_KEY_SECRET
required_env GROQ_API_KEY
required_env INTERNAL_SERVICE_SECRET

SMTP_FROM_VALUE="${SMTP_FROM:-$SMTP_USER}"
GRAFANA_ADMIN_PASSWORD_VALUE="${GRAFANA_ADMIN_PASSWORD:-admin}"

echo "[vault-seed] writing required secrets to Vault"
vault kv put secret/eventzen/auth-service \
  MONGODB_URI="$MONGO_ATLAS_URI" \
  JWT_SECRET="$JWT_SECRET" \
  JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  SMTP_USER="$SMTP_USER" \
  SMTP_PASS="$SMTP_PASS" \
  SMTP_FROM="$SMTP_FROM_VALUE" \
  CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" \
  CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY" \
  CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET" \
  INTERNAL_SERVICE_SECRET="$INTERNAL_SERVICE_SECRET" >/dev/null

vault kv put secret/eventzen/payment-service \
  MONGODB_URI="$MONGO_ATLAS_URI" \
  RAZORPAY_KEY_ID="$RAZORPAY_KEY_ID" \
  RAZORPAY_KEY_SECRET="$RAZORPAY_KEY_SECRET" \
  INTERNAL_SERVICE_SECRET="$INTERNAL_SERVICE_SECRET" >/dev/null

vault kv put secret/eventzen/event-service \
  MONGO_URI="$MONGO_ATLAS_URI" \
  GROQ_API_KEY="$GROQ_API_KEY" \
  INTERNAL_SERVICE_SECRET="$INTERNAL_SERVICE_SECRET" >/dev/null

vault kv put secret/eventzen/budget-service \
  MONGO_URI="$MONGO_ATLAS_URI" \
  INTERNAL_SERVICE_SECRET="$INTERNAL_SERVICE_SECRET" >/dev/null

vault kv put secret/eventzen/booking-service \
  MongoDbSettings__ConnectionString="$MONGO_ATLAS_URI" \
  SmtpSettings__User="$SMTP_USER" \
  SmtpSettings__Password="$SMTP_PASS" \
  SmtpSettings__From="$SMTP_FROM_VALUE" \
  INTERNAL_SERVICE_SECRET="$INTERNAL_SERVICE_SECRET" >/dev/null

vault kv put secret/eventzen/notification-service \
  MONGODB_URI="$MONGO_ATLAS_URI" \
  INTERNAL_SERVICE_SECRET="$INTERNAL_SERVICE_SECRET" >/dev/null

vault kv put secret/eventzen/api-gateway \
  JWT_SECRET="$JWT_SECRET" \
  INTERNAL_SERVICE_SECRET="$INTERNAL_SERVICE_SECRET" >/dev/null

vault kv put secret/eventzen/grafana \
  GF_SECURITY_ADMIN_PASSWORD="$GRAFANA_ADMIN_PASSWORD_VALUE" >/dev/null

echo "[vault-seed] secrets seeded successfully"
