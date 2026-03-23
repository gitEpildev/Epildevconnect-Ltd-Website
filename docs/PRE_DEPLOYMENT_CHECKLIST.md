# ✅ Pre-Deployment Checklist

**Complete this checklist before pushing to GitHub and deploying to production.**

---

## 🔐 **Security & Environment**

### **Critical - Never Commit These!**

- [x] `.env` file is in `.gitignore` ✅
- [x] `.dockerignore` excludes `.env*` files ✅
- [ ] Remove any hardcoded secrets from code
- [ ] Verify no API keys in source files
- [ ] Check no passwords in comments or logs

### **Environment Variables**

Verify your `.env` file has ALL required variables:

```bash
# Run this to check:
npm run check-env
```

**Required Variables:**

- [ ] `SESSION_SECRET` (generate with `npm run generate-secret`)
- [ ] `DISCORD_CLIENT_ID`
- [ ] `DISCORD_CLIENT_SECRET`
- [ ] `DISCORD_REDIRECT_URI` (must be production URL for deployment)
- [ ] `VITE_DISCORD_USER_ID`
- [ ] `ADMIN_DISCORD_ID`
- [ ] `DISCORD_BOT_TOKEN`
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `LASTFM_API_KEY`
- [ ] `LASTFM_USERNAME`
- [ ] `WAKATIME_API_KEY`
- [ ] `POSTGRES_USER`
- [ ] `POSTGRES_PASSWORD`
- [ ] `POSTGRES_HOST` (use `postgres` for Docker, `localhost` for local)
- [ ] `POSTGRES_PORT` (use `5432` inside Docker, external is `1800`)
- [ ] `POSTGRES_DB`

---

## 📁 **Git & Version Control**

### **Before First Push to GitHub**

```bash
# 1. Initialize Git (if not done)
git init

# 2. Check what will be committed
git status

# 3. Verify .env is NOT listed
# If it appears, something is wrong with .gitignore!

# 4. Add all files
git add .

# 5. Check again (paranoia check)
git status

# 6. First commit
git commit -m "Initial commit: MY HUB dashboard"

# 7. Add remote (replace with your repo URL)
git remote add origin https://github.com/gitEpildev/myhub.git

# 8. Push to GitHub
git push -u origin main
```

### **Verify .gitignore is Working**

Files that should **NEVER** appear in `git status`:

- ❌ `.env`
- ❌ `.env.local`
- ❌ `.env.production`
- ❌ `node_modules/`
- ❌ `dist/`
- ❌ `data/`
- ❌ `.DS_Store`

Files that **SHOULD** be committed:

- ✅ `.env.example` (template with no real values)
- ✅ `.gitignore`
- ✅ `.dockerignore`
- ✅ `Dockerfile`
- ✅ `docker-compose.yml`
- ✅ All source code (`src/`, `server/`, `public/`)
- ✅ `package.json` & `package-lock.json`
- ✅ Documentation (`docs/`, `README.md`)

---

## 🐳 **Docker Setup**

### **Test Docker Build Locally**

```bash
# 1. Build the image
docker-compose build

# 2. Run containers
docker-compose up -d

# 3. Check logs
docker-compose logs -f

# 4. Verify health
docker ps

# 5. Test the site
# Open: http://localhost:1500

# 6. Stop containers
docker-compose down
```

### **Docker Files Checklist**

- [x] `Dockerfile` uses production command (`npm start`) ✅
- [x] `docker-compose.yml` includes PostgreSQL ✅
- [x] `.dockerignore` excludes sensitive files ✅
- [ ] Health checks configured
- [ ] Volumes for persistent data (PostgreSQL)

---

## ⚙️ **Production Configuration**

### **Update These for Production**

#### **1. Discord OAuth Redirect URI**

In Discord Developer Portal (https://discord.com/developers/applications):

- Go to your application → OAuth2
- Add redirect URI: `https://developer.epildevconnect.uk/myhub/auth/callback`
- Update `.env`: `DISCORD_REDIRECT_URI=https://developer.epildevconnect.uk/myhub/auth/callback`

⚠️ **CRITICAL**: The URL MUST include `/myhub/` subdirectory path!

#### **2. Rate Limiting**

✅ Already configured for production:

```typescript
// server/index.ts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 login attempts per 15 minutes
  // ...
});
```

No changes needed - this is your production rate limit.

#### **3. CORS Origins**

In `server/index.ts`:

```typescript
app.use(
  cors({
    origin: 'https://developer.epildevconnect.uk', // Update from localhost
    credentials: true,
  })
);
```

#### **4. Session Secret**

```bash
# Generate a new secure session secret for production
npm run generate-secret

# Copy the output to your production .env file
```

---

## 🧪 **Testing Before Deployment**

### **Functionality Tests**

- [ ] All pages load correctly
- [ ] Navigation works (all links)
- [ ] Discord presence updates in real-time
- [ ] Last.fm shows current music
- [ ] WakaTime displays coding stats
- [ ] Contact form sends emails successfully
- [ ] Contact form sends confirmation emails
- [ ] Messages system works (login, send, receive)
- [ ] Admin dashboard accessible (admin only)
- [ ] User blocking/unblocking works
- [ ] Error pages display correctly (404, Error Boundary)

### **Security Tests**

- [ ] Non-admin cannot access `/admin`
- [ ] Blocked users cannot log in
- [ ] Rate limiting works (try spamming form)
- [ ] Session persists after page refresh
- [ ] Logout works correctly

### **Mobile Responsiveness**

- [ ] Test on phone (or Chrome DevTools mobile view)
- [ ] All sections readable on small screens
- [ ] Messages page mobile-friendly
- [ ] Forms work on mobile
- [ ] Navigation menu works on mobile

---

## 🚀 **Deployment Steps**

### **Option 1: Docker Deployment (Recommended)**

1. Push code to GitHub
2. SSH into your server
3. Clone repository
4. Create `.env` file with production values
5. Run:
   ```bash
   docker-compose up -d
   ```
6. Set up Nginx reverse proxy (see `docs/CLOUDFLARE_SETUP.md`)
7. Configure Cloudflare DNS
8. Verify site loads at your domain

### **Option 2: Manual Deployment**

1. Push code to GitHub
2. SSH into your server
3. Clone repository
4. Install PostgreSQL
5. Create `.env` file
6. Run:
   ```bash
   npm install
   npm run build
   npm start
   ```
7. Set up Nginx
8. Configure Cloudflare

---

## 🌐 **Cloudflare Setup**

Follow the complete guide: `docs/CLOUDFLARE_SETUP.md`

**Quick Checklist:**

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated
- [ ] DNS A record pointing to server IP
- [ ] SSL/TLS set to "Full (strict)"
- [ ] "Always Use HTTPS" enabled
- [ ] Page rules configured
- [ ] WAF (firewall) enabled

---

## 📊 **Post-Deployment Verification**

### **Once Deployed, Test:**

- [ ] `https://yourdomain.com` loads
- [ ] SSL certificate is valid (green lock)
- [ ] Discord OAuth works
- [ ] Contact form sends emails
- [ ] Messages system works
- [ ] Admin dashboard accessible
- [ ] Real-time features update
- [ ] Check browser console for errors
- [ ] Check server logs for errors
- [ ] Test from different devices/networks

---

## 🔄 **Backup & Monitoring**

### **Set Up Backups**

- [ ] PostgreSQL automatic backups
- [ ] Database backup script
- [ ] Environment file backup (secure location)

### **Monitoring**

- [ ] Cloudflare Analytics enabled
- [ ] Server monitoring (CPU, RAM, disk)
- [ ] Log rotation configured
- [ ] Uptime monitoring (optional: UptimeRobot, Better Uptime)

---

## 📝 **Documentation**

### **Update These Files**

- [ ] `README.md` - Add deployment URL
- [ ] `docs/DEPLOYMENT.md` - Any deployment notes
- [ ] `CHANGELOG.md` - Version 1.0.0 release notes

---

## ⚠️ **CRITICAL REMINDERS**

### **🔴 NEVER COMMIT:**

- `.env` file
- API keys
- Passwords
- Session secrets
- Database credentials

### **🟡 ALWAYS VERIFY:**

- `.gitignore` is working
- Secrets are in environment variables
- Production URLs are updated
- Rate limits are set correctly
- HTTPS is enforced

### **🟢 DOUBLE CHECK:**

- Run `git status` before every commit
- Test locally before deploying
- Have a rollback plan
- Keep backups of database

---

## 🎉 **Ready to Deploy!**

If you've checked all items above, you're ready to push to GitHub and deploy to production!

**Final Commands:**

```bash
# 1. Verify no secrets
grep -r "API_KEY" src/ server/ --exclude-dir=node_modules

# 2. Final git check
git status

# 3. Push to GitHub
git push origin main

# 4. Deploy!
# SSH to your server and follow deployment steps above
```

---

**Good luck with your deployment! 🚀**

If you encounter issues, check:

- Server logs: `docker-compose logs -f`
- Browser console: F12 → Console
- Cloudflare Analytics: Check for errors
- Documentation: `docs/` folder
