pid_file = "/tmp/vault-agent-auth.pid"

vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/runtime/auth-service-role-id"
      secret_id_file_path = "/tmp/auth-service-secret-id"
    }
  }

  sink "file" {
    config = {
      path = "/tmp/auth-service-token"
    }
  }
}

template {
  source      = "/vault/agent/templates/auth-service.ctmpl"
  destination = "/vault/runtime/auth-service.env"
}
