# Khanyi Backend API - Ubuntu Server Deployment Guide

## Prerequisites

### 1. Ubuntu Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally (alternative to forever)
sudo npm install -g pm2

# Install forever globally
sudo npm install -g forever

# Install MongoDB (if using local database)
sudo apt install -y mongodb

# Install Git
sudo apt install -y git
```

### 2. Create Application User
```bash
# Create ubuntu user (if not exists)
sudo adduser ubuntu
sudo usermod -aG sudo ubuntu

# Switch to ubuntu user
su - ubuntu
```

## Deployment Steps

### 1. Clone Repository
```bash
cd /home/ubuntu
git clone <your-repository-url> khanyi-backend
cd khanyi-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# Database
MONGODB_URI=mongodb+srv://khanyiadmin:khanyiadmin123@vendingcluster0.u7seoi4.mongodb.net/khanyi_vending?retryWrites=true&w=majority&appName=VendingCluster0

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Server
PORT=3000
NODE_ENV=production
```

### 4. Set Up Logs Directory
```bash
mkdir -p logs
chmod 755 logs
```

### 5. Make Scripts Executable
```bash
chmod +x start.sh stop.sh restart.sh
```

### 6. Start the Application

#### Option A: Using Forever
```bash
# Start the application
./start.sh

# Check status
forever list

# View logs
forever logs khanyi-backend

# Stop application
./stop.sh

# Restart application
./restart.sh
```

#### Option B: Using PM2 (Recommended)
```bash
# Start with PM2
pm2 start server.js --name "khanyi-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

# PM2 Commands
pm2 list          # List processes
pm2 logs          # View logs
pm2 restart all   # Restart all
pm2 stop all      # Stop all
pm2 delete all    # Delete all
```

## Production Configuration

### 1. Nginx Reverse Proxy
```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/khanyi-backend
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/khanyi-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 2. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Firewall Configuration
```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 4. MongoDB Atlas IP Whitelist
1. Go to MongoDB Atlas Dashboard
2. Navigate to Network Access
3. Add your server's IP address
4. Or add `0.0.0.0/0` for all IPs (less secure)

## Monitoring and Maintenance

### 1. Health Checks
```bash
# Check API health
curl http://localhost:3000/health

# Check with domain
curl https://your-domain.com/health
```

### 2. Log Management
```bash
# View application logs
tail -f logs/forever.log
tail -f logs/error.log

# Rotate logs (add to crontab)
0 0 * * * find /home/ubuntu/khanyi-backend/logs -name "*.log" -mtime +7 -delete
```

### 3. Backup Strategy
```bash
# Create backup script
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/khanyi-backend-$DATE.tar.gz /home/ubuntu/khanyi-backend

# Keep only last 7 days of backups
find $BACKUP_DIR -name "khanyi-backend-*.tar.gz" -mtime +7 -delete
```

## Troubleshooting

### Common Issues:

1. **Port Already in Use**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   ```

2. **Permission Denied**
   ```bash
   sudo chown -R ubuntu:ubuntu /home/ubuntu/khanyi-backend
   chmod +x *.sh
   ```

3. **MongoDB Connection Issues**
   - Check IP whitelist in MongoDB Atlas
   - Verify connection string
   - Check network connectivity

4. **Application Won't Start**
   ```bash
   # Check logs
   forever logs khanyi-backend

   # Check environment
   node -e "console.log(process.env)"
   ```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, unique secrets
3. **Database Access**: Use MongoDB Atlas IP whitelist
4. **SSL/TLS**: Always use HTTPS in production
5. **Firewall**: Restrict access to necessary ports only
6. **Updates**: Keep system and dependencies updated

## Performance Optimization

1. **PM2 Cluster Mode**:
   ```bash
   pm2 start server.js -i max --name "khanyi-backend"
   ```

2. **Nginx Caching**:
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Database Indexing**: Ensure proper MongoDB indexes
4. **Memory Management**: Monitor memory usage with `htop` or `free -h`
