# 🚀 Quick Start Guide

Get MY HUB running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- A code editor

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your credentials. **Minimum required**:

```env
# Your Discord User ID (required for Lanyard)
DISCORD_USER_ID=850726663289700373

# Optional: Discord OAuth (for contact form login)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:1500/auth/callback

# Optional: Last.fm (for music tracking)
LASTFM_USERNAME=your_username
LASTFM_API_KEY=your_api_key

# Optional: WakaTime (for coding stats)
WAKATIME_USERNAME=your_username
WAKATIME_API_KEY=your_api_key

# Optional: SMTP (for contact form email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Session secret (generate a random string)
SESSION_SECRET=my-super-secret-key-change-this

# Ports (defaults are fine)
FRONTEND_PORT=1500
BACKEND_PORT=1600
```

### Getting API Keys

**Discord User ID:**

1. Enable Developer Mode in Discord (Settings → App Settings → Advanced)
2. Right-click your profile → Copy User ID

**Discord OAuth (Optional):**

1. Go to https://discord.com/developers/applications
2. Create new application
3. Get Client ID and Secret from OAuth2 tab
4. Add redirect: `http://localhost:1500/auth/callback`

**Last.fm (Optional):**

1. Sign up at https://www.last.fm
2. Get API key: https://www.last.fm/api/account/create

**WakaTime (Optional):**

1. Sign up at https://wakatime.com
2. Install IDE plugin
3. Get API key: https://wakatime.com/settings/api-key

## Step 3: Start Development

```bash
npm run dev
```

This starts:

- **Frontend**: http://localhost:1500
- **Backend**: http://localhost:1600

## Step 4: Open in Browser

Navigate to **http://localhost:1500**

You should see:

- ✅ Terminal boot sequence animation
- ✅ Quantum particle background
- ✅ Navigation sidebar
- ✅ Real-time dashboard (if APIs configured)

## Troubleshooting

### "Cannot find module" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
# Change ports in .env
FRONTEND_PORT=3000
BACKEND_PORT=4000
```

### APIs not working

- Check API keys in `.env`
- Verify backend is running (should see logs)
- Check browser console for errors

### Particle background not showing

- Clear browser cache
- Try different browser
- Check console for WebGL errors

## Next Steps

### 1. Customise Content

Edit these files to personalize:

- `src/sections/Projects.tsx` - Your projects
- `src/sections/TechStack.tsx` - Your skills
- `src/sections/Experience.tsx` - Your work history
- `src/sections/CodeViewer.tsx` - Code examples

### 2. Update Social Links

Add to `.env`:

```env
VITE_SOCIAL_INSTAGRAM=https://instagram.com/your_handle
VITE_SOCIAL_YOUTUBE=https://youtube.com/@your_channel
VITE_SOCIAL_DISCORD=https://discord.gg/your_server
VITE_SOCIAL_TELEGRAM=https://t.me/your_handle
```

### 3. Deploy to Production

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for:

- Docker deployment
- Cloudflare setup
- SSL configuration
- Nginx setup

## Project Structure

```
MyLink/
├── src/
│   ├── components/      # Reusable React components
│   ├── sections/        # Page sections (Home, Projects, etc)
│   ├── utils/          # Helper functions and hooks
│   └── App.tsx         # Main app component
├── server/             # Backend Express server
├── docs/              # Documentation
└── .env               # Your configuration (don't commit!)
```

## Available Commands

```bash
# Development (runs both frontend + backend)
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## Features Overview

### ✅ Implemented Features

- ✨ **Quantum particle background** with WebGL
- 🎮 **Real-time Discord presence** via Lanyard
- 🎵 **Live music tracking** from Last.fm
- ⌨️ **Coding stats** from WakaTime
- 📊 **System uptime monitor**
- 📡 **Combined activity feed**
- 🔐 **Discord OAuth login**
- 📧 **Dual-mode contact form** (Discord DM / Email)
- 🎬 **Terminal boot sequence**
- 😴 **Auto-hide sensitive info** when idle
- 📱 **Fully responsive** design
- 🎨 **Glassmorphism UI** with animations

### 📋 Sections

1. **Home** - Real-time dashboard
2. **Projects** - Your work showcase
3. **Tech Stack** - Tools and technologies
4. **Experience** - Career timeline
5. **Code Viewer** - Syntax-highlighted examples
6. **Contact** - Get in touch form

## Common Customizations

### Change Theme Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  quantum: {
    glow: '#00d9ff', // Change this!
  }
}
```

### Disable Boot Sequence

In `src/App.tsx`, change:

```typescript
const [showBoot, setShowBoot] = useState(false); // Changed from true
```

### Adjust Polling Interval

In `src/sections/Home.tsx`:

```typescript
// Change from 1000ms (1 second) to whatever you want
const lanyard = usePolling(() => fetchLanyardData(DISCORD_USER_ID), 5000);
```

### Add More Projects

Edit `src/sections/Projects.tsx`:

```typescript
const projects = [
  {
    id: 1,
    title: 'Your Project',
    description: 'Description here',
    tech: ['React', 'Node.js'],
    github: 'https://github.com/...',
    demo: 'https://...',
    featured: true,
  },
  // Add more...
];
```

## Performance Tips

- APIs update every second by default (configurable)
- Particle count adjusts based on screen size
- Static assets are cached
- Images use lazy loading
- Code splitting with React lazy imports

## Security Notes

- ⚠️ Never commit `.env` file
- ⚠️ Keep API keys secret
- ⚠️ Use HTTPS in production
- ⚠️ Set strong session secret
- ⚠️ Update dependencies regularly

## Getting Help

1. Check [README.md](README.md) for detailed info
2. See [docs/SETUP.md](docs/SETUP.md) for API setup
3. Read [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production
4. Review [docs/API.md](docs/API.md) for API details

## What's Next?

- ⚡ Add your own features
- 🎨 Customise the design
- 📱 Test on mobile devices
- 🚀 Deploy to production
- 📊 Add analytics
- 🔔 Set up monitoring

---

**Built by [@epildev](https://discord.com/users/850726663289700373)**

Need help? Open an issue or reach out on Discord!
