# ──────────────────────────────────────────────────────────
# Terraform configuration for motor-x on Google Cloud (GCP)
# Deploys an e2-micro Compute Engine VM running the Docker image
# ──────────────────────────────────────────────────────────

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Allow public HTTP (port 80) traffic to the motor-x VM
resource "google_compute_firewall" "motor_x_http" {
  name    = "${var.vm_name}-allow-http"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["motor-x-web"]
}

# Compute Engine VM running the motor-x Docker container
resource "google_compute_instance" "motor_x" {
  name                      = var.vm_name
  machine_type              = var.machine_type
  zone                      = var.zone
  tags                      = ["motor-x-web"]
  allow_stopping_for_update = true

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 10
    }
  }

  network_interface {
    network = "default"
    # Assign an ephemeral public IP so the app is reachable in the browser
    access_config {}
  }

  metadata_startup_script = <<-EOF
    #!/bin/bash
    set -e
    # Deploy revision: ${var.deploy_rev}
    if ! command -v docker >/dev/null 2>&1; then
      apt-get update -y
      apt-get install -y docker.io
      systemctl enable --now docker
    fi
    docker rm -f motor-x || true
    docker pull ${var.image}
    docker run -d --name motor-x --restart always -p 80:80 ${var.image}
  EOF

  depends_on = [google_compute_firewall.motor_x_http]
}
