pid_file = "/tmp/vault-agent-grafana.pid"

vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/runtime/grafana-role-id"
      secret_id_file_path = "/tmp/grafana-secret-id"
    }
  }

  sink "file" {
    config = {
      path = "/tmp/grafana-token"
    }
  }
}

template {
  source      = "/vault/agent/templates/grafana.ctmpl"
  destination = "/vault/runtime/grafana.env"
}
