# -*- mode: ruby -*-
# vi: set ft=ruby :

# Local Vagrant VM for running motor-x with Docker + Terraform + GitHub Self-Hosted Runner
# Start with: vagrant up
# Access app: http://127.0.0.1:8000 or http://192.168.56.10:8000

Vagrant.configure("2") do |config|
  # Use bento/ubuntu-22.04 (fast, reliable on Windows VirtualBox; avoids ubuntu/jammy64 boot hang)
  config.vm.box = "bento/ubuntu-22.04"
  config.vm.hostname = "motor-x-vm"
  config.vm.boot_timeout = 600

  # Forward port 8000 and 3000 to host & assign static private IP
  config.vm.network "forwarded_port", guest: 8000, host: 8000, auto_correct: true
  config.vm.network "forwarded_port", guest: 3000, host: 3000, auto_correct: true
  config.vm.network "private_network", ip: "192.168.56.10"

  config.ssh.insert_key = false

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "2048"
    vb.cpus = 2
  end

  # Install Docker automatically
  config.vm.provision "shell", inline: <<-SHELL
    set -e
    apt-get update -y
    apt-get install -y docker.io curl unzip
    usermod -aG docker vagrant
    systemctl enable --now docker
  SHELL
end
