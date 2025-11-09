#!/bin/bash

# DigitalOcean Ubuntu 22.04 Initialization Script
# This runs automatically when droplet first boots!

apt update
apt upgrade -y

# Install Python & PostgreSQL
apt install -y python3-pip python3-dev postgresql postgresql-contrib nginx curl

# Install Redis (for caching/celery)
apt install -y redis-server

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE my_ecommerce_db;"
sudo -u postgres psql -c "CREATE USER my_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "ALTER ROLE my_user SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE my_user SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE my_user SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE my_ecommerce_db TO my_user;"

# Install your Python requirements
pip3 install -r /home/your_project/requirements.txt

# Set up Gunicorn service (copy your service file)
# Set up Nginx config (copy your config)
# Enable firewall
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

echo "🦄 PROVISIONING COMPLETE! Your e-commerce server is ready!"