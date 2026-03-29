pid_file = "/tmp/vault-agent-payment.pid"

vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/runtime/payment-service-role-id"
      secret_id_file_path = "/tmp/payment-service-secret-id"
    }
  }

  sink "file" {
    config = {
      path = "/tmp/payment-service-token"
    }
  }
}

template {
  source      = "/vault/agent/templates/payment-service.ctmpl"
  destination = "/vault/runtime/payment-service.env"
}
