pid_file = "/tmp/vault-agent-event.pid"

vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/runtime/event-service-role-id"
      secret_id_file_path = "/tmp/event-service-secret-id"
    }
  }

  sink "file" {
    config = {
      path = "/tmp/event-service-token"
    }
  }
}

template {
  source      = "/vault/agent/templates/event-service.ctmpl"
  destination = "/vault/runtime/event-service.env"
}
