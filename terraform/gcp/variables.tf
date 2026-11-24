variable "project_id" {
  type        = string
  description = "Google Cloud Project ID"
  default     = "terraform-learning-514508"
}

variable "region" {
  type        = string
  description = "Google Cloud Region"
  default     = "asia-south1"
}

variable "zone" {
  type        = string
  description = "Google Cloud Zone"
  default     = "asia-south1-a"
}

variable "vm_name" {
  type        = string
  description = "Name of the GCP Compute Engine VM"
  default     = "motor-x-vm"
}

variable "machine_type" {
  type        = string
  description = "GCP Compute Engine machine type"
  default     = "e2-micro"
}

variable "image" {
  type        = string
  description = "Fully qualified Docker Hub image to deploy"
  default     = "deenamanick/motor-x:latest"
}

variable "deploy_rev" {
  type        = string
  description = "Commit SHA or revision tag to track deployments"
  default     = "manual"
}
