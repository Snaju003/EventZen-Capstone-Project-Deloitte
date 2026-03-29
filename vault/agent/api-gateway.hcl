pid_file = "/tmp/vault-agent-api-gateway.pid"

vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/runtime/api-gateway-role-id"
      secret_id_file_path = "/tmp/api-gateway-secret-id"
    }
  }

  sink "file" {
    config = {
      path = "/tmp/api-gateway-token"
    }
  }
}

template {
  source      = "/vault/agent/templates/api-gateway.ctmpl"
  destination = "/vault/runtime/api-gateway.env"
}
