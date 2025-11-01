# 🌐 Cloudflare Tunnel Setup Guide

Complete guide for setting up Cloudflare Tunnel (cloudflared) for secure, zero-downtime deployment.

---

## 🎯 **What is Cloudflare Tunnel?**

Cloudflare Tunnel (formerly Argo Tunnel) creates a secure, outbound-only connection from your server to Cloudflare's edge network. Benefits:

✅ **No exposed ports** - Your server doesn't need to open ports 80/443  
✅ **Better security** - Only outbound connections, no inbound firewall rules needed  
✅ **Automatic SSL** - Cloudflare handles all SSL/TLS certificates  
✅ **DDoS protection** - Built-in protection at Cloudflare's edge  
✅ **No nginx required** - Direct routing to your services  
✅ **Easy deployment** - Works behind NAT, firewalls, and dynamic IPs

---

## 📋 **Prerequisites**

- [ ] Cloudflare account (free tier works)
- [ ] Domain added to Cloudflare
- [ ] Docker and Docker Compose installed
- [ ] Access to Cloudflare dashboard

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Cloudflare Tunnel**

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Networks → Tunnels**
3. Click **Create a tunnel**
4. Select **Cloudflared** (Docker)
5. Give your tunnel a name (e.g., `myhub-tunnel`)
6. Click **Save tunnel**

### **Step 2: Get Tunnel Credentials**

After creating the tunnel:

1. You'll see a **Tunnel ID** (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
2. Click **Configure** button next to your tunnel
3. You'll see commands to install cloudflared
4. Copy the **Tunnel Secret** from the credentials (you'll need this)

Alternatively, you can download the credentials file:
- Click **Configure** → **Configure from command line**
- Copy the command shown (it includes the tunnel secret)

### **Step 3: Download Credentials File**

Run this command (replace with your tunnel ID and secret):

```bash
# Create credentials file
cat > cloudflare-credentials.json << EOF
{
  "AccountTag": "YOUR_ACCOUNT_TAG",
  "TunnelSecret": "YOUR_TUNNEL_SECRET_BASE64",
  "TunnelID": "YOUR_TUNNEL_ID",
  "TunnelName": "myhub-tunnel"
}
EOF
```

**OR** use the Cloudflare dashboard:

1. In the tunnel configuration page
2. Click **Configure** → Download credentials
3. Save the file as `cloudflare-credentials.json` in your project root

### **Step 4: Configure DNS Routes**

In Cloudflare dashboard (Networks → Tunnels → Your Tunnel → Configure):

1. Click **Public Hostname** tab
2. Add a new public hostname:
   - **Subdomain**: `developer` (or leave blank for root)
   - **Domain**: `epildevconnect.uk` (or your domain)
   - **Service Type**: `HTTP`
   - **Service URL**: `http://localhost:1500` (your frontend port)

3. Add another route for API:
   - **Subdomain**: `developer` (same)
   - **Domain**: `epildevconnect.uk`
   - **Path**: `/api/*`
   - **Service Type**: `HTTP`
   - **Service URL**: `http://localhost:1600` (your backend port)

4. Add route for auth:
   - **Subdomain**: `developer`
   - **Domain**: `epildevconnect.uk`
   - **Path**: `/auth/*`
   - **Service Type**: `HTTP`
   - **Service URL**: `http://localhost:1600`

### **Step 5: Update Environment Variables**

Add these to your `.env` file:

```env
# Cloudflare Tunnel Configuration
CLOUDFLARE_TUNNEL_ID=your-tunnel-id-here
CLOUDFLARE_DOMAIN=developer.epildevconnect.uk
```

### **Step 6: Update Cloudflare Tunnel Config**

Edit `cloudflare-tunnel-config.yml` and replace placeholders:

```yaml
tunnel: your-actual-tunnel-id-here
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: developer.epildevconnect.uk
    service: http://localhost:1500
  
  - hostname: developer.epildevconnect.uk
    path: /api/*
    service: http://localhost:1600
  
  - hostname: developer.epildevconnect.uk
    path: /auth/*
    service: http://localhost:1600
  
  - service: http_status:404
```

### **Step 7: Deploy with Docker Compose**

```bash
# Make sure credentials file exists
ls -la cloudflare-credentials.json

# Start all services including tunnel
docker-compose up -d

# Check tunnel logs
docker-compose logs -f cloudflared
```

### **Step 8: Verify Tunnel is Running**

```bash
# Check tunnel status
docker-compose exec cloudflared cloudflared tunnel info

# Check logs
docker-compose logs cloudflared

# Test your site
curl https://developer.epildevconnect.uk
```

---

## 🔧 **Quick Setup Script**

For easier setup, run:

```bash
chmod +x scripts/setup-cloudflare-tunnel.sh
./scripts/setup-cloudflare-tunnel.sh
```

This script will:
1. Prompt for tunnel ID
2. Prompt for tunnel secret
3. Create credentials file
4. Update configuration files
5. Verify setup

---

## 📝 **Configuration Details**

### **Ingress Rules Order**

⚠️ **Important**: Ingress rules are evaluated **top to bottom**. Order matters!

```yaml
ingress:
  # Most specific first
  - hostname: developer.epildevconnect.uk
    path: /api/*
    service: http://localhost:1600
  
  # Then less specific
  - hostname: developer.epildevconnect.uk
    service: http://localhost:1500
  
  # Catch-all last
  - service: http_status:404
```

### **Path Routing**

If your app uses `/myhub/` subdirectory:

```yaml
ingress:
  - hostname: developer.epildevconnect.uk
    path: /myhub/api/*
    service: http://localhost:1600
  
  - hostname: developer.epildevconnect.uk
    path: /myhub/*
    service: http://localhost:1500
  
  - service: http_status:404
```

---

## 🔒 **Security Configuration**

### **Cloudflare Dashboard Settings**

1. **SSL/TLS Mode**: Set to **Full (strict)**
   - SSL/TLS → Overview → Encryption mode

2. **Always Use HTTPS**: Enable
   - SSL/TLS → Edge Certificates → Always Use HTTPS

3. **WAF Rules**: Enable managed rules
   - Security → WAF → Managed rules

4. **Bot Fight Mode**: Enable
   - Security → Bots → Bot Fight Mode

---

## ✅ **Verification Checklist**

After setup:

- [ ] Tunnel is running: `docker-compose ps cloudflared`
- [ ] Site loads: `https://developer.epildevconnect.uk`
- [ ] SSL certificate is valid (check browser)
- [ ] API endpoints work: `https://developer.epildevconnect.uk/api/health`
- [ ] Auth redirects work: Test Discord OAuth
- [ ] Real-time features work (Discord, Last.fm, WakaTime)
- [ ] No exposed ports: `sudo netstat -tulpn | grep -E ':(80|443)'` (should return empty)

---

## 🔧 **Troubleshooting**

### **Tunnel Won't Start**

```bash
# Check credentials file format
cat cloudflare-credentials.json | jq

# Check config file syntax
docker-compose exec cloudflared cloudflared tunnel --config /etc/cloudflared/config.yml validate

# Check logs
docker-compose logs cloudflared
```

### **Site Not Loading**

1. **Check tunnel status**:
   ```bash
   docker-compose exec cloudflared cloudflared tunnel info
   ```

2. **Verify DNS in Cloudflare**:
   - DNS → Records → Check that tunnel routes exist

3. **Check ingress rules**:
   - Networks → Tunnels → Your Tunnel → Configure → Public Hostnames

4. **Test local services**:
   ```bash
   curl http://localhost:1500
   curl http://localhost:1600/health
   ```

### **SSL Certificate Errors**

- Ensure SSL/TLS mode is **Full (strict)**
- Tunnel handles SSL automatically - no server certificates needed

### **504 Gateway Timeout**

- Check that your services are running on correct ports
- Verify ingress rules point to correct service URLs
- Check application logs: `docker-compose logs myhub`

### **Connection Refused**

- Verify services are listening on localhost (not 127.0.0.1)
- Check if services use `network_mode: "host"` in docker-compose
- Test connectivity: `curl http://localhost:1500` from host

---

## 🔄 **Updating Tunnel Configuration**

After changing `cloudflare-tunnel-config.yml`:

```bash
# Restart tunnel service
docker-compose restart cloudflared

# Or rebuild
docker-compose up -d --force-recreate cloudflared
```

---

## 📊 **Monitoring Tunnel**

### **Check Tunnel Status**

```bash
# View tunnel info
docker-compose exec cloudflared cloudflared tunnel info

# View tunnel routes
docker-compose exec cloudflared cloudflared tunnel route dns list
```

### **View Logs**

```bash
# Real-time logs
docker-compose logs -f cloudflared

# Last 100 lines
docker-compose logs --tail=100 cloudflared
```

### **Cloudflare Dashboard**

Monitor in dashboard:
- Networks → Tunnels → Your Tunnel → Metrics
- View connection status, bandwidth, requests

---

## 🔐 **Security Best Practices**

1. ✅ **Protect credentials file**:
   ```bash
   chmod 600 cloudflare-credentials.json
   ```

2. ✅ **Don't commit credentials to git**:
   ```bash
   echo "cloudflare-credentials.json" >> .gitignore
   ```

3. ✅ **Use secrets management** (production):
   - Docker secrets
   - Environment variables
   - Cloudflare API tokens

4. ✅ **Enable Cloudflare WAF**:
   - Block malicious traffic
   - Rate limiting
   - Geographic restrictions

5. ✅ **Monitor tunnel health**:
   - Set up alerts for tunnel disconnections
   - Monitor Cloudflare dashboard

---

## 🌍 **Multiple Domains/Subdomains**

To route multiple domains through one tunnel:

```yaml
ingress:
  # Domain 1
  - hostname: developer.epildevconnect.uk
    service: http://localhost:1500
  
  # Domain 2
  - hostname: api.epildevconnect.uk
    service: http://localhost:1600
  
  # Wildcard subdomain
  - hostname: *.epildevconnect.uk
    service: http://localhost:1500
  
  - service: http_status:404
```

Add DNS records in Cloudflare for each domain/subdomain (as CNAME pointing to tunnel).

---

## 💰 **Cost**

- **Cloudflare Tunnel**: Free (unlimited bandwidth on free plan)
- **Cloudflare Zero Trust**: Free tier includes:
  - Unlimited tunnels
  - Unlimited users (if using Zero Trust features)
  - 50 devices (if using WARP)

Perfect for personal projects and small deployments!

---

## 📖 **Additional Resources**

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Docker Installation Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)
- [Configuration Reference](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/)
- [Ingress Rules Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/local/local-management/ingress/)

---

## 🆚 **Tunnel vs Traditional Proxy**

| Feature | Cloudflare Tunnel | Traditional (nginx + Cloudflare) |
|---------|------------------|----------------------------------|
| Ports to open | None (outbound only) | 80, 443 |
| SSL certificates | Automatic (Cloudflare) | Need Let's Encrypt |
| Firewall config | None needed | Must allow inbound |
| Setup complexity | Simple | More complex |
| NAT traversal | Yes | Requires port forwarding |
| Dynamic IP | Works | Requires DDNS |

**Tunnel is recommended** for:
- Servers behind NAT/firewalls
- Dynamic IP addresses
- Simplified deployments
- Better security posture

---

**Your site is now accessible securely through Cloudflare Tunnel! 🚀**

