pid_file = "/tmp/vault-agent-budget.pid"

vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/runtime/budget-service-role-id"
      secret_id_file_path = "/tmp/budget-service-secret-id"
    }
  }

  sink "file" {
    config = {
      path = "/tmp/budget-service-token"
    }
  }
}

template {
  source      = "/vault/agent/templates/budget-service.ctmpl"
  destination = "/vault/runtime/budget-service.env"
}
