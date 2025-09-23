#!/bin/bash

# Khanyi Backend API Deployment Script
# Run this script on your Ubuntu server to deploy the application

echo "🚀 Starting Khanyi Backend API Deployment..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "❌ Please don't run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 already installed: $(pm2 --version)"
fi

# Install forever globally if not installed
if ! command -v forever &> /dev/null; then
    echo "📦 Installing Forever..."
    sudo npm install -g forever
else
    echo "✅ Forever already installed: $(forever --version)"
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
else
    echo "✅ Nginx already installed"
fi

# Create application directory
APP_DIR="/home/$(whoami)/khanyi-backend"
echo "📁 Setting up application directory: $APP_DIR"

# Create logs directory
mkdir -p $APP_DIR/logs
chmod 755 $APP_DIR/logs

# Make scripts executable
chmod +x start.sh stop.sh restart.sh deploy.sh

# Install application dependencies
echo "📦 Installing application dependencies..."
npm install --production

# Set up environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create it with your configuration."
    echo "📝 Copy .env.example to .env and configure your settings."
fi

echo "✅ Deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your .env file with production settings"
echo "2. Start the application with: ./start.sh"
echo "3. Or use PM2: pm2 start ecosystem.config.js --env production"
echo "4. Configure Nginx reverse proxy (see DEPLOYMENT.md)"
echo "5. Set up SSL certificate for HTTPS"
echo ""
echo "🔧 Useful commands:"
echo "  - Start: ./start.sh"
echo "  - Stop: ./stop.sh"
echo "  - Restart: ./restart.sh"
echo "  - PM2 start: pm2 start ecosystem.config.js"
echo "  - PM2 status: pm2 list"
echo "  - PM2 logs: pm2 logs"
echo "  - Health check: curl http://localhost:3000/health"
