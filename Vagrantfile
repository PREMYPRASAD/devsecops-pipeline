# -*- mode: ruby -*-
# vi: set ft=ruby :

# Local Vagrant VM for running motor-x with Docker + Terraform
# Start with: vagrant up
# Access app: http://localhost:3000 or http://192.168.56.10:3000

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"
  config.vm.hostname = "motor-x-vm"

  # Forward port 3000 to host & assign static private IP
  config.vm.network "forwarded_port", guest: 3000, host: 3000
  config.vm.network "private_network", ip: "192.168.56.10"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "2048"
    vb.cpus = 2
  end

  # Install Docker & Terraform inside the VM automatically
  config.vm.provision "shell", inline: <<-SHELL
    set -e
    apt-get update -y
    apt-get install -y docker.io curl unzip
    usermod -aG docker vagrant
    systemctl enable --now docker
  SHELL
end
