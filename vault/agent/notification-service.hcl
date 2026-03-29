pid_file = "/tmp/vault-agent-notification.pid"

vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/runtime/notification-service-role-id"
      secret_id_file_path = "/tmp/notification-service-secret-id"
    }
  }

  sink "file" {
    config = {
      path = "/tmp/notification-service-token"
    }
  }
}

template {
  source      = "/vault/agent/templates/notification-service.ctmpl"
  destination = "/vault/runtime/notification-service.env"
}
