#!/bin/sh
set -eu

if [ "${1:-}" = "" ] || [ "${2:-}" = "" ]; then
  echo "usage: $0 <service-name> <agent-config-path>"
  exit 1
fi

SERVICE_NAME="$1"
AGENT_CONFIG="$2"
WRAP_TOKEN_FILE="/vault/runtime/${SERVICE_NAME}-secret-id-wrap-token"
UNWRAPPED_SECRET_FILE="/tmp/${SERVICE_NAME}-secret-id"

echo "[vault-agent-wrapper][$SERVICE_NAME] waiting for wrap token file"
until [ -s "$WRAP_TOKEN_FILE" ]; do
  sleep 1
done

WRAP_TOKEN="$(cat "$WRAP_TOKEN_FILE")"
if [ -z "$WRAP_TOKEN" ]; then
  echo "[vault-agent-wrapper][$SERVICE_NAME] wrap token is empty"
  exit 1
fi

echo "[vault-agent-wrapper][$SERVICE_NAME] unwrapping secret-id"
SECRET_ID="$(VAULT_TOKEN="$WRAP_TOKEN" vault unwrap -field=secret_id)"

if [ -z "$SECRET_ID" ]; then
  echo "[vault-agent-wrapper][$SERVICE_NAME] unwrap failed: empty secret-id"
  exit 1
fi

printf "%s" "$SECRET_ID" >"$UNWRAPPED_SECRET_FILE"
chmod 0600 "$UNWRAPPED_SECRET_FILE"

echo "[vault-agent-wrapper][$SERVICE_NAME] starting vault agent"
exec vault agent -config="$AGENT_CONFIG"
