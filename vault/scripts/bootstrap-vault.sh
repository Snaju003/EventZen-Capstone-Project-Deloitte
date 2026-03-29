#!/bin/sh
set -eu

echo "[vault-init] waiting for Vault API"
until vault status >/dev/null 2>&1; do
  sleep 1
done

echo "[vault-init] enabling AppRole auth"
vault auth enable approle >/dev/null 2>&1 || true

echo "[vault-init] ensuring KV v2 engine at secret/"
vault secrets enable -path=secret kv-v2 >/dev/null 2>&1 || true

mkdir -p /vault/runtime
chmod 0777 /vault/runtime

require_secret_key() {
  secret_path="$1"
  secret_key="$2"

  if ! vault kv get -field="$secret_key" "$secret_path" >/dev/null 2>&1; then
    echo "[vault-init] missing required Vault secret: path=$secret_path key=$secret_key"
    exit 1
  fi
}

echo "[vault-init] validating required secrets are pre-seeded in Vault"
require_secret_key "secret/eventzen/auth-service" "MONGODB_URI"
require_secret_key "secret/eventzen/auth-service" "JWT_SECRET"
require_secret_key "secret/eventzen/auth-service" "JWT_REFRESH_SECRET"
require_secret_key "secret/eventzen/auth-service" "SMTP_USER"
require_secret_key "secret/eventzen/auth-service" "SMTP_PASS"
require_secret_key "secret/eventzen/auth-service" "SMTP_FROM"
require_secret_key "secret/eventzen/auth-service" "CLOUDINARY_CLOUD_NAME"
require_secret_key "secret/eventzen/auth-service" "CLOUDINARY_API_KEY"
require_secret_key "secret/eventzen/auth-service" "CLOUDINARY_API_SECRET"
require_secret_key "secret/eventzen/auth-service" "INTERNAL_SERVICE_SECRET"

require_secret_key "secret/eventzen/payment-service" "MONGODB_URI"
require_secret_key "secret/eventzen/payment-service" "RAZORPAY_KEY_ID"
require_secret_key "secret/eventzen/payment-service" "RAZORPAY_KEY_SECRET"
require_secret_key "secret/eventzen/payment-service" "INTERNAL_SERVICE_SECRET"

require_secret_key "secret/eventzen/event-service" "MONGO_URI"
require_secret_key "secret/eventzen/event-service" "GROQ_API_KEY"
require_secret_key "secret/eventzen/event-service" "INTERNAL_SERVICE_SECRET"

require_secret_key "secret/eventzen/budget-service" "MONGO_URI"
require_secret_key "secret/eventzen/budget-service" "INTERNAL_SERVICE_SECRET"

require_secret_key "secret/eventzen/booking-service" "MongoDbSettings__ConnectionString"
require_secret_key "secret/eventzen/booking-service" "SmtpSettings__User"
require_secret_key "secret/eventzen/booking-service" "SmtpSettings__Password"
require_secret_key "secret/eventzen/booking-service" "SmtpSettings__From"
require_secret_key "secret/eventzen/booking-service" "INTERNAL_SERVICE_SECRET"

require_secret_key "secret/eventzen/notification-service" "MONGODB_URI"
require_secret_key "secret/eventzen/notification-service" "INTERNAL_SERVICE_SECRET"
require_secret_key "secret/eventzen/api-gateway" "JWT_SECRET"
require_secret_key "secret/eventzen/api-gateway" "INTERNAL_SERVICE_SECRET"
require_secret_key "secret/eventzen/grafana" "GF_SECURITY_ADMIN_PASSWORD"

cat <<'EOF' >/tmp/auth-service-policy.hcl
path "secret/data/eventzen/auth-service" {
  capabilities = ["read"]
}
EOF

cat <<'EOF' >/tmp/payment-service-policy.hcl
path "secret/data/eventzen/payment-service" {
  capabilities = ["read"]
}
EOF

cat <<'EOF' >/tmp/event-service-policy.hcl
path "secret/data/eventzen/event-service" {
  capabilities = ["read"]
}
EOF

cat <<'EOF' >/tmp/budget-service-policy.hcl
path "secret/data/eventzen/budget-service" {
  capabilities = ["read"]
}
EOF

cat <<'EOF' >/tmp/booking-service-policy.hcl
path "secret/data/eventzen/booking-service" {
  capabilities = ["read"]
}
EOF

cat <<'EOF' >/tmp/notification-service-policy.hcl
path "secret/data/eventzen/notification-service" {
  capabilities = ["read"]
}
EOF

cat <<'EOF' >/tmp/api-gateway-policy.hcl
path "secret/data/eventzen/api-gateway" {
  capabilities = ["read"]
}
EOF

cat <<'EOF' >/tmp/grafana-policy.hcl
path "secret/data/eventzen/grafana" {
  capabilities = ["read"]
}
EOF

echo "[vault-init] applying Vault policies"
vault policy write auth-service /tmp/auth-service-policy.hcl >/dev/null
vault policy write payment-service /tmp/payment-service-policy.hcl >/dev/null
vault policy write event-service /tmp/event-service-policy.hcl >/dev/null
vault policy write budget-service /tmp/budget-service-policy.hcl >/dev/null
vault policy write booking-service /tmp/booking-service-policy.hcl >/dev/null
vault policy write notification-service /tmp/notification-service-policy.hcl >/dev/null
vault policy write api-gateway /tmp/api-gateway-policy.hcl >/dev/null
vault policy write grafana /tmp/grafana-policy.hcl >/dev/null

echo "[vault-init] configuring AppRole roles"
vault write auth/approle/role/auth-service \
  token_policies="auth-service" \
  token_ttl="1h" \
  token_max_ttl="4h" >/dev/null

vault write auth/approle/role/payment-service \
  token_policies="payment-service" \
  token_ttl="1h" \
  token_max_ttl="4h" >/dev/null

vault write auth/approle/role/event-service \
  token_policies="event-service" \
  token_ttl="1h" \
  token_max_ttl="4h" >/dev/null

vault write auth/approle/role/budget-service \
  token_policies="budget-service" \
  token_ttl="1h" \
  token_max_ttl="4h" >/dev/null

vault write auth/approle/role/booking-service \
  token_policies="booking-service" \
  token_ttl="1h" \
  token_max_ttl="4h" >/dev/null

vault write auth/approle/role/notification-service \
  token_policies="notification-service" \
  token_ttl="1h" \
  token_max_ttl="4h" >/dev/null

vault write auth/approle/role/api-gateway \
  token_policies="api-gateway" \
  token_ttl="1h" \
  token_max_ttl="4h" >/dev/null

vault write auth/approle/role/grafana \
  token_policies="grafana" \
  token_ttl="1h" \
  token_max_ttl="4h" >/dev/null

echo "[vault-init] writing AppRole credentials for sidecars"
vault read -field=role_id auth/approle/role/auth-service/role-id >/vault/runtime/auth-service-role-id
vault write -f -wrap-ttl=30m -field=wrapping_token auth/approle/role/auth-service/secret-id >/vault/runtime/auth-service-secret-id-wrap-token

vault read -field=role_id auth/approle/role/payment-service/role-id >/vault/runtime/payment-service-role-id
vault write -f -wrap-ttl=30m -field=wrapping_token auth/approle/role/payment-service/secret-id >/vault/runtime/payment-service-secret-id-wrap-token

vault read -field=role_id auth/approle/role/event-service/role-id >/vault/runtime/event-service-role-id
vault write -f -wrap-ttl=30m -field=wrapping_token auth/approle/role/event-service/secret-id >/vault/runtime/event-service-secret-id-wrap-token

vault read -field=role_id auth/approle/role/budget-service/role-id >/vault/runtime/budget-service-role-id
vault write -f -wrap-ttl=30m -field=wrapping_token auth/approle/role/budget-service/secret-id >/vault/runtime/budget-service-secret-id-wrap-token

vault read -field=role_id auth/approle/role/booking-service/role-id >/vault/runtime/booking-service-role-id
vault write -f -wrap-ttl=30m -field=wrapping_token auth/approle/role/booking-service/secret-id >/vault/runtime/booking-service-secret-id-wrap-token

vault read -field=role_id auth/approle/role/notification-service/role-id >/vault/runtime/notification-service-role-id
vault write -f -wrap-ttl=30m -field=wrapping_token auth/approle/role/notification-service/secret-id >/vault/runtime/notification-service-secret-id-wrap-token

vault read -field=role_id auth/approle/role/api-gateway/role-id >/vault/runtime/api-gateway-role-id
vault write -f -wrap-ttl=30m -field=wrapping_token auth/approle/role/api-gateway/secret-id >/vault/runtime/api-gateway-secret-id-wrap-token

vault read -field=role_id auth/approle/role/grafana/role-id >/vault/runtime/grafana-role-id
vault write -f -wrap-ttl=30m -field=wrapping_token auth/approle/role/grafana/secret-id >/vault/runtime/grafana-secret-id-wrap-token

chmod 0644 /vault/runtime/auth-service-role-id /vault/runtime/auth-service-secret-id-wrap-token
chmod 0644 /vault/runtime/payment-service-role-id /vault/runtime/payment-service-secret-id-wrap-token
chmod 0644 /vault/runtime/event-service-role-id /vault/runtime/event-service-secret-id-wrap-token
chmod 0644 /vault/runtime/budget-service-role-id /vault/runtime/budget-service-secret-id-wrap-token
chmod 0644 /vault/runtime/booking-service-role-id /vault/runtime/booking-service-secret-id-wrap-token
chmod 0644 /vault/runtime/notification-service-role-id /vault/runtime/notification-service-secret-id-wrap-token
chmod 0644 /vault/runtime/api-gateway-role-id /vault/runtime/api-gateway-secret-id-wrap-token
chmod 0644 /vault/runtime/grafana-role-id /vault/runtime/grafana-secret-id-wrap-token

echo "[vault-init] bootstrap complete"
