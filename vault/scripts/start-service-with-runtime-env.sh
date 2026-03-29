#!/bin/sh
set -eu

if [ "${1:-}" = "" ] || [ "${2:-}" = "" ]; then
  echo "usage: $0 <service-name> <command> [args...]"
  exit 1
fi

SERVICE_NAME="$1"
shift

VAULT_ENV_FILE="/vault/runtime/${SERVICE_NAME}.env"
RUNTIME_ENV_FILE="/tmp/.env.runtime"

echo "[service-wrapper][$SERVICE_NAME] waiting for rendered Vault env"
until [ -s "$VAULT_ENV_FILE" ]; do
  sleep 1
done

cp "$VAULT_ENV_FILE" "$RUNTIME_ENV_FILE"
chmod 0600 "$RUNTIME_ENV_FILE"

set -a
. "$RUNTIME_ENV_FILE"
set +a

rm -f "$RUNTIME_ENV_FILE"

echo "[service-wrapper][$SERVICE_NAME] loaded runtime env and removed temp file"
exec "$@"
