# 🚀 MY HUB

> A real-time, futuristic personal dashboard showcasing live presence, projects, and communication channels.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

![MY HUB Screenshot](https://via.placeholder.com/800x400/0a0a0f/00d9ff?text=MY+HUB+Dashboard)

---

## ✨ Features

### 🎯 Real-Time Dashboard

- **Discord Presence** - Live status via Lanyard API
- **Now Playing** - Real-time music from Last.fm
- **Coding Activity** - Live stats from WakaTime
- **System Uptime** - Session tracking

### 💬 Discord DM System

- Full messaging interface
- Admin dashboard for conversation management
- PostgreSQL-backed persistence
- Real-time message updates

### 🔒 Security Features

- IP address logging
- 3-tier rate limiting
- User blocking system
- Admin-only dashboard
- Privacy Policy & Terms of Service

### 📱 Mobile Responsive

- Optimised for all screen sizes
- Touch-friendly interface
- Adaptive layouts
- Native mobile feel

### 🎨 Modern UI/UX

- Glassmorphism design
- Particle background (WebGL)
- Smooth Framer Motion animations
- Dark mode only (futuristic aesthetic)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Discord Application (for OAuth)

### Installation

```bash
# Clone the repository
git clone https://github.com/gitEpildev/myhub.git
cd myhub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Initialize database
npm run setup

# Start development servers
npm run dev
```

Visit: **http://localhost:1500**

---

## 📖 Documentation

### Getting Started

- **[Quick Start Guide](docs/QUICKSTART.md)** - 5-minute setup
- **[Start Here](docs/START_HERE.md)** - First-time setup walkthrough
- **[Setup Guide](docs/SETUP.md)** - Detailed API configuration

### Guides

- **[Admin Setup](docs/guides/ADMIN_SETUP.md)** - Enable admin navigation
- **[Discord Bot Setup](docs/guides/DISCORD_BOT_SETUP.md)** - Configure Discord API
- **[Discord DM System](docs/guides/DISCORD_DM_SETUP.md)** - Set up messaging
- **[Security Features](docs/guides/SECURITY_FEATURES.md)** - Security documentation
- **[Badge Auto-Update](docs/guides/BADGE-AUTO-UPDATE.md)** - Automated badge system
- **[Mobile Responsive](docs/guides/MOBILE_RESPONSIVE.md)** - Mobile optimization guide

### Technical

- **[API Reference](docs/API.md)** - Complete API documentation
- **[Architecture](docs/ARCHITECTURE.md)** - System design overview
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment guide
- **[Project Summary](docs/PROJECT_SUMMARY.md)** - Complete feature list

### Development

- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines
- **[Changelog](CHANGELOG.md)** - Version history

---

## 🛠️ Tech Stack

| Category           | Technologies                                   |
| ------------------ | ---------------------------------------------- |
| **Frontend**       | React, TypeScript, Tailwind CSS, Framer Motion |
| **Backend**        | Node.js, Express, TypeScript                   |
| **Database**       | PostgreSQL                                     |
| **Authentication** | Discord OAuth2, Passport.js                    |
| **APIs**           | Lanyard, Last.fm, WakaTime, Discord            |
| **Build Tools**    | Vite, ESLint, Prettier                         |
| **Deployment**     | Docker, Docker Compose, Cloudflare             |

---

## 📁 Project Structure

```
myhub/
├── src/
│   ├── components/      # React components
│   ├── sections/        # Page sections
│   ├── utils/          # Utilities & hooks
│   └── main.tsx        # Entry point
├── server/
│   ├── index.ts        # Express server
│   └── db.ts           # Database logic
├── docs/               # Documentation
│   ├── guides/         # User guides
│   └── development/    # Dev docs
├── public/             # Static assets
└── scripts/            # Build & utility scripts
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Server Ports
FRONTEND_PORT=1500
BACKEND_PORT=1600

# Discord
DISCORD_USER_ID=your_discord_id
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:1500/auth/callback
DISCORD_BOT_TOKEN=your_bot_token
ADMIN_DISCORD_ID=your_admin_id
VITE_DISCORD_USER_ID=your_discord_id
VITE_ADMIN_DISCORD_ID=your_admin_id

# Last.fm
LASTFM_USERNAME=your_username
LASTFM_API_KEY=your_api_key

# WakaTime
WAKATIME_USERNAME=your_username
WAKATIME_API_KEY=your_api_key

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=myhub
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_password

# Session
SESSION_SECRET=your_generated_secret
```

---

## 🎯 Key Features

### Admin Dashboard

- View all registered users
- Track IP addresses
- Block/unblock users
- Delete users and data
- Manage conversations

### Messaging System

- Discord-like interface
- Real-time updates
- Admin sees all conversations
- Users see only their own
- Close/reopen/delete conversations

### Security

- Rate limiting (API, Auth, Messages)
- IP logging on all logins
- User blocking system
- Automatic session management
- Protected admin endpoints

---

## 📱 Browser Support

| Browser | Desktop | Mobile  |
| ------- | ------- | ------- |
| Chrome  | ✅ Full | ✅ Full |
| Firefox | ✅ Full | ✅ Full |
| Safari  | ✅ Full | ✅ Full |
| Edge    | ✅ Full | ✅ Full |

---

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production

```bash
# Build frontend
npm run build

# Start production server
npm run preview

# Or use Docker
docker-compose up -d
```

See **[Deployment Guide](docs/DEPLOYMENT.md)** for detailed instructions.

---

## 🤝 Contributing

Contributions are welcome! Please read our **[Contributing Guidelines](CONTRIBUTING.md)** first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the **[LICENSE](LICENSE)** file for details.

---

## 👤 Author

**Blake (@epildev)** - EpilDevConnect

### 📬 Contact
- **Discord**: epildev (850726663289700373)
- **Email**: [connectwithme@epildevconnect.uk](mailto:connectwithme@epildevconnect.uk)
- **GitHub**: [@gitEpildev](https://github.com/gitEpildev)
- **Website**: [epildevconnect.uk](https://epildevconnect.uk)

### 🌐 Connect with Me
- **Instagram**: [@adb.epildev](https://www.instagram.com/adb.epildev/)
- **Discord Server**: [Join Server](https://discord.gg/nvjrfsAQF7)
- **Telegram**: [@adbepildev](https://t.me/adbepildev)
- **Facebook**: [AD.Blake.Evan.McBride](https://www.facebook.com/AD.Blake.Evan.McBride/)

---

## 🙏 Acknowledgements

- [Lanyard API](https://github.com/Phineas/lanyard) - Discord presence
- [Last.fm API](https://www.last.fm/api) - Music tracking
- [WakaTime API](https://wakatime.com/developers) - Coding stats
- [Discord API](https://discord.com/developers/docs) - OAuth & badges
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

## 📞 Support

Need help? Check the **[Documentation](docs/)** or open an issue.

---

<div align="center">

**[Website](http://localhost:1500)** • **[Documentation](docs/)** • **[Report Bug](https://github.com/gitEpildev/myhub/issues)** • **[Request Feature](https://github.com/gitEpildev/myhub/issues)**

Made with 💙 by Blake

</div>
