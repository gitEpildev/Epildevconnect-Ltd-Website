# Setup Guide

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Docker** and **Docker Compose** (for production deployment)

## API Keys Setup

### 1. Discord Application

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Navigate to "OAuth2" section
4. Add redirect URI: `http://localhost:1500/auth/callback` (local) or your production URL
5. Copy your Client ID and Client Secret
6. Note your Discord User ID (enable Developer Mode in Discord settings)

### 2. Last.fm API

1. Create an account at https://www.last.fm
2. Go to https://www.last.fm/api/account/create
3. Create an API application
4. Copy your API Key
5. Your username is your Last.fm profile name

### 3. WakaTime API

1. Sign up at https://wakatime.com
2. Install WakaTime plugin in your IDE
3. Go to https://wakatime.com/settings/api-key
4. Copy your API Key
5. Your username is your WakaTime profile name

### 4. SMTP Configuration

For email functionality, you need SMTP credentials. Options:

- **Gmail**: Use App Passwords (https://support.google.com/accounts/answer/185833)
- **SendGrid**: Free tier available (https://sendgrid.com)
- **Mailgun**: Free tier available (https://www.mailgun.com)
- **Your hosting provider**: Many providers include SMTP

## Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in your credentials:

```env
# Discord Configuration
DISCORD_USER_ID=850726663289700373
DISCORD_TAG=@epildev
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:1500/auth/callback

# Last.fm Configuration
LASTFM_USERNAME=your_lastfm_username
LASTFM_API_KEY=your_lastfm_api_key

# WakaTime Configuration
WAKATIME_USERNAME=your_wakatime_username
WAKATIME_API_KEY=your_wakatime_api_key

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Port Configuration
FRONTEND_PORT=1500
BACKEND_PORT=1600
API_PORT=1700

# Session Secret (generate random string)
SESSION_SECRET=generate_random_string_here

# Social Links (Frontend accessible with VITE_ prefix)
VITE_SOCIAL_INSTAGRAM=https://instagram.com/your_handle
VITE_SOCIAL_YOUTUBE=https://youtube.com/@your_channel
VITE_SOCIAL_TIKTOK=https://tiktok.com/@your_handle
VITE_SOCIAL_DISCORD=https://discord.gg/your_server
VITE_SOCIAL_TELEGRAM=https://t.me/your_handle
VITE_SOCIAL_FACEBOOK=https://facebook.com/your_profile

# GitHub (Frontend accessible with VITE_ prefix)
VITE_GITHUB_USERNAME=your_github_username
VITE_GITHUB_FEATURED_REPO=your_repo_name
```

## Local Development Setup

1. **Install dependencies**:

```bash
npm install
```

2. **Start development servers**:

```bash
npm run dev
```

This will start:

- Frontend: http://localhost:1500
- Backend: http://localhost:1600

3. **Open your browser**:
   Navigate to http://localhost:1500

## Production Deployment

### Using Docker (Recommended)

1. **Ensure .env is configured with production values**

2. **Update DISCORD_REDIRECT_URI** in .env:

```env
DISCORD_REDIRECT_URI=https://your-domain.com/myhub/auth/callback
```

3. **Build and start**:

```bash
docker-compose up -d
```

4. **Check logs**:

```bash
docker-compose logs -f
```

### Manual Deployment

1. **Build the frontend**:

```bash
npm run build
```

2. **Install production dependencies**:

```bash
npm ci --only=production
```

3. **Start the backend**:

```bash
npm run dev:backend
```

4. **Serve the frontend**:
   Use nginx, Apache, or any static file server to serve the `dist` folder.

## Cloudflare Setup

1. **Add site to Cloudflare**:

   - Add your domain to Cloudflare
   - Update nameservers at your domain registrar

2. **DNS Configuration**:

   - Add A record pointing to your server IP
   - Enable Cloudflare proxy (orange cloud)

3. **SSL/TLS**:

   - Set SSL/TLS to "Full" or "Full (strict)"
   - Enable "Always Use HTTPS"

4. **Page Rules** (Optional):
   - Create rule for `/myhub/*`
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours

## Nginx Configuration

If using nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name developer.epildevconnect.uk;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name developer.epildevconnect.uk;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location /myhub/ {
        proxy_pass http://localhost:1500/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /myhub/api/ {
        proxy_pass http://localhost:1600/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Auth endpoints
    location /myhub/auth/ {
        proxy_pass http://localhost:1600/auth/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Troubleshooting

### Common Issues

**1. "Cannot find module" errors**

```bash
rm -rf node_modules package-lock.json
npm install
```

**2. Port already in use**

```bash
# Find process using port
lsof -i :1500
lsof -i :1600

# Kill process
kill -9 <PID>
```

**3. APIs returning errors**

- Verify API keys are correct
- Check API rate limits
- Ensure backend server is running
- Check browser console for CORS errors

**4. Discord OAuth not working**

- Verify redirect URI matches exactly in Discord app
- Check client ID and secret
- Ensure session secret is set
- Clear browser cookies and try again

**5. Docker build fails**

```bash
# Clear Docker cache
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
```

## Testing

### Test API Endpoints

```bash
# Health check
curl http://localhost:1600/health

# Lanyard API
curl http://localhost:1600/api/lanyard/850726663289700373

# Last.fm API
curl http://localhost:1600/api/lastfm/recent

# WakaTime API
curl http://localhost:1600/api/wakatime/stats
```

### Test Frontend

1. Open http://localhost:1500
2. Check browser console for errors
3. Test all navigation items
4. Verify particle background is rendering
5. Check that real-time updates are working

## Security Checklist

- [ ] .env file is in .gitignore
- [ ] Session secret is random and secure
- [ ] SMTP credentials are correct
- [ ] Discord OAuth redirect URIs are whitelisted
- [ ] CORS origins are properly configured
- [ ] API keys have appropriate permissions
- [ ] Docker containers run as non-root user
- [ ] SSL/TLS is enabled in production

## Next Steps

After setup is complete:

1. Customise content in `src/sections/`
2. Update project information
3. Add your own projects and experience
4. Test all features thoroughly
5. Deploy to production
6. Set up monitoring and logging

## Support

If you encounter issues:

1. Check the troubleshooting section
2. Review logs: `docker-compose logs -f`
3. Check GitHub issues
4. Reach out via Discord
