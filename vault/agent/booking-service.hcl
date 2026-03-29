pid_file = "/tmp/vault-agent-booking.pid"

vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/runtime/booking-service-role-id"
      secret_id_file_path = "/tmp/booking-service-secret-id"
    }
  }

  sink "file" {
    config = {
      path = "/tmp/booking-service-token"
    }
  }
}

template {
  source      = "/vault/agent/templates/booking-service.ctmpl"
  destination = "/vault/runtime/booking-service.env"
}
