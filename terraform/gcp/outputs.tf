output "vm_name" {
  description = "Name of the deployed GCP VM"
  value       = google_compute_instance.motor_x.name
}

output "vm_external_ip" {
  description = "Public IP address of the deployed GCP VM"
  value       = google_compute_instance.motor_x.network_interface[0].access_config[0].nat_ip
}

output "app_url" {
  description = "Live URL for the motor-x application"
  value       = "http://${google_compute_instance.motor_x.network_interface[0].access_config[0].nat_ip}"
}
