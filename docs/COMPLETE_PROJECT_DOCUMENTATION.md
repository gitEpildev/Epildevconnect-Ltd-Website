# 📘 MY HUB - Complete Project Documentation

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready  
**Live URL**: https://developer.epildevconnect.uk/myhub/

---

## 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Frontend Architecture](#frontend-architecture)
8. [Backend Architecture](#backend-architecture)
9. [Authentication & Security](#authentication--security)
10. [Features & Functionality](#features--functionality)
11. [Configuration & Environment](#configuration--environment)
12. [Development Setup](#development-setup)
13. [Deployment Guide](#deployment-guide)
14. [Scripts & Utilities](#scripts--utilities)
15. [Troubleshooting](#troubleshooting)
16. [Performance Optimization](#performance-optimization)
17. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**MY HUB** is a real-time, futuristic personal dashboard application built by @epildev. It serves as a live command center showcasing real-time presence, coding activity, music preferences, and communication channels through stunning visual effects and seamless API integrations.

### Key Highlights

- **Full-Stack Application**: React + TypeScript frontend with Node.js + Express backend
- **Real-Time Integrations**: Discord presence (Lanyard API), Last.fm music tracking, WakaTime coding stats
- **Messaging System**: Discord OAuth authentication with real-time messaging capabilities
- **Database-Driven**: PostgreSQL for user management, conversations, messages, and project descriptions
- **Production-Ready**: Docker containerization, Cloudflare Tunnel deployment, comprehensive error handling
- **Modern UI/UX**: Glassmorphism design, particle effects, smooth animations, responsive layout

---

## Project Overview

### Purpose

MY HUB is designed to be a comprehensive personal dashboard that:
- Displays real-time activity and presence
- Showcases projects and technical expertise
- Provides communication channels for visitors
- Tracks and displays coding statistics
- Integrates multiple third-party APIs seamlessly

### Target Audience

- **Primary**: Personal portfolio/dashboard for @epildev
- **Secondary**: Developers interested in real-time dashboard implementations
- **Tertiary**: Employers/clients viewing technical capabilities

### Core Value Proposition

1. **Real-Time Data**: Live updates from multiple APIs (Discord, Last.fm, WakaTime)
2. **Modern Design**: Futuristic UI with particle effects and glassmorphism
3. **Full-Stack Architecture**: Demonstrates complete application development skills
4. **Production Quality**: Enterprise-grade error handling, security, and deployment

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   React App  │  │   Vite Dev   │  │  Static Files │     │
│  │  (Frontend)  │  │    Server    │  │   (Assets)    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTPS            │                  │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│              Cloudflare Tunnel / CDN                         │
│         (developer.epildevconnect.uk)                        │
└─────────┬──────────────────┬──────────────────┬─────────────┘
          │                  │                  │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                    Express Backend Server                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  API Routes  │  │  Auth/Passport│  │  Static Serve│     │
│  │  (Express)   │  │  (Discord OAuth)│ │  (Vite Build)│     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                   PostgreSQL Database                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Users     │  │ Conversations│  │   Messages   │     │
│  │  (Security)  │  │  (Chat System)│  │  (Chat Data) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Project Descriptions (OpenAI Cache)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │
          │ API Calls
          │
┌─────────▼───────────────────────────────────────────────────┐
│              External APIs                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Discord  │  │ Last.fm  │  │ WakaTime │  │  GitHub  │   │
│  │ (Lanyard)│  │  (Music) │  │  (Coding)│  │  (Repos) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           OpenAI (Project Descriptions)              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Frontend Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Navigation.tsx  # Navigation sidebar/menu
│   ├── ParticleBackground.tsx  # WebGL particle effects
│   ├── DiscordPresence.tsx     # Discord status card
│   ├── NowPlaying.tsx          # Last.fm music card
│   ├── WakaTimeStats.tsx       # Coding statistics
│   ├── ActivityFeed.tsx        # Combined activity stream
│   ├── SystemUptime.tsx        # Uptime counter
│   ├── SocialLinks.tsx         # Social media links
│   ├── BootSequence.tsx        # Terminal boot animation
│   ├── ErrorBoundary.tsx       # Error handling
│   └── messages/               # Messaging components
│       ├── ChatView.tsx        # Chat interface
│       └── ConversationList.tsx # Conversation sidebar
├── sections/           # Page sections/routes
│   ├── Home.tsx       # Real-time dashboard
│   ├── Projects.tsx   # Project showcase
│   ├── TechStack.tsx  # Tools & technologies
│   ├── Experience.tsx # Career timeline
│   ├── SystemSpecs.tsx # System specifications
│   ├── CodeViewer.tsx # Code examples
│   ├── Contact.tsx    # Contact form
│   ├── Messages.tsx   # Messaging system
│   ├── AdminDashboard.tsx # Admin panel
│   ├── PrivacyPolicy.tsx # Privacy policy
│   ├── TermsOfService.tsx # Terms of service
│   └── NotFound.tsx   # 404 page
├── utils/              # Utilities & helpers
│   ├── api.ts         # API client functions
│   └── hooks.ts       # Custom React hooks
├── App.tsx            # Main app component
├── main.tsx           # React entry point
└── index.css          # Global styles
```

#### Backend Structure

```
server/
├── index.ts           # Main server file
│   ├── Express setup
│   ├── Middleware configuration
│   ├── Authentication routes
│   ├── API proxy routes
│   ├── Messaging routes
│   ├── Admin routes
│   └── Static file serving
├── db.ts              # Database functions
│   ├── Connection pool
│   ├── Schema initialization
│   ├── User management
│   ├── Conversation management
│   ├── Message management
│   └── Project description cache
└── services/
    └── openai.ts      # OpenAI integration
        ├── Description generation
        └── Placeholder detection
```

### Data Flow

1. **Frontend Request**: User interaction triggers API call via `utils/api.ts`
2. **Backend Processing**: Express routes handle request, apply middleware (auth, rate limiting)
3. **Database Query**: PostgreSQL queries for user data, conversations, messages
4. **External API Call**: Proxy requests to external APIs (Discord, Last.fm, WakaTime, GitHub)
5. **Response Processing**: Transform and cache responses
6. **Frontend Update**: React components re-render with new data

### Request/Response Flow Example

```
User clicks "View Projects"
    ↓
Projects.tsx component mounts
    ↓
useEffect triggers fetchGitHubRepos()
    ↓
API request: GET /myhub/api/github/repos
    ↓
Express route handler: GET /api/github/repos
    ↓
Check cache → If cached, return cached data
    ↓
If not cached:
    ├── Fetch from GitHub API
    ├── Transform data
    ├── Cache result
    └── Return response
    ↓
Frontend receives data
    ↓
React component re-renders with projects
```

---

## Technology Stack

### Frontend Technologies

#### Core Framework
- **React 18.3.1**: Modern React with hooks and concurrent features
- **TypeScript 5.3.3**: Type-safe JavaScript for better DX and fewer bugs
- **Vite 5.1.0**: Next-generation build tool with lightning-fast HMR

#### UI/UX Libraries
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Framer Motion 11.0.3**: Production-ready motion library for React
- **Lucide React 0.344.0**: Beautiful icon library
- **Prism React Renderer 2.3.1**: Syntax highlighting for code blocks

#### 3D Graphics
- **Three.js 0.161.0**: 3D graphics library
- **@react-three/fiber 8.15.16**: React renderer for Three.js
- **@react-three/drei 9.99.0**: Useful helpers for React Three Fiber

#### Routing & HTTP
- **React Router DOM 6.22.0**: Declarative routing for React
- **Axios 1.6.7**: Promise-based HTTP client

### Backend Technologies

#### Runtime & Framework
- **Node.js 20+**: JavaScript runtime
- **Express 4.18.2**: Minimalist web framework
- **TypeScript 5.3.3**: Type-safe backend development

#### Authentication
- **Passport 0.7.0**: Authentication middleware
- **Passport Discord 0.1.4**: Discord OAuth strategy
- **Express Session 1.18.0**: Session management

#### Database
- **PostgreSQL**: Relational database
- **pg 8.15.3**: PostgreSQL client for Node.js

#### Communication
- **Discord.js 14.24.2**: Discord API wrapper for bot functionality
- **Nodemailer 6.9.9**: Email sending library

#### AI Integration
- **OpenAI 4.0.0**: OpenAI API client for project descriptions

#### Utilities
- **CORS 2.8.5**: Cross-Origin Resource Sharing
- **dotenv 16.4.5**: Environment variable management
- **express-rate-limit 8.1.0**: Rate limiting middleware
- **date-fns 4.1.0**: Date utility library

### Development Tools

- **tsx 4.7.1**: TypeScript execution
- **Concurrently 8.2.2**: Run multiple commands concurrently
- **TypeScript**: Type checking
- **PostCSS 8.4.35**: CSS processing
- **Autoprefixer 10.4.17**: CSS vendor prefixing

### Deployment

- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Cloudflare Tunnel**: Secure tunneling to backend
- **Nginx**: Reverse proxy (optional)

---

## Database Schema

### Tables Overview

The application uses PostgreSQL with the following schema:

#### 1. `users` Table

Stores user authentication and security information.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,      -- Discord user ID
  user_name VARCHAR(255) NOT NULL,            -- Discord username
  user_avatar VARCHAR(500),                   -- Avatar URL
  ip_address VARCHAR(45),                     -- IP address for security
  is_blocked BOOLEAN DEFAULT FALSE,           -- Block status
  block_reason TEXT,                          -- Reason for blocking
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_users_user_id` on `user_id`
- `idx_users_is_blocked` on `is_blocked`
- `idx_users_ip_address` on `ip_address`

**Purpose:**
- Track Discord OAuth users
- Implement user blocking functionality
- Log IP addresses for security
- Maintain user profiles

#### 2. `conversations` Table

Stores conversation metadata for the messaging system.

```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,              -- Discord user ID
  user_name VARCHAR(255) NOT NULL,            -- Discord username
  user_avatar VARCHAR(500),                   -- Avatar URL
  last_message TEXT,                          -- Preview of last message
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'open',          -- 'open' or 'closed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_conversations_user_id` on `user_id`
- `idx_conversations_status` on `status`

**Purpose:**
- One conversation per user
- Track conversation status (open/closed)
- Store preview of last message
- Link to messages table

#### 3. `messages` Table

Stores individual messages within conversations.

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) NOT NULL,            -- Discord user ID
  sender_name VARCHAR(255) NOT NULL,          -- Discord username
  sender_avatar VARCHAR(500),                 -- Avatar URL
  content TEXT NOT NULL,                      -- Message content
  is_admin BOOLEAN DEFAULT FALSE,             -- Admin message flag
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_messages_conversation_id` on `conversation_id`
- `idx_messages_created_at` on `created_at`

**Foreign Keys:**
- `conversation_id` → `conversations(id)` ON DELETE CASCADE

**Purpose:**
- Store message content
- Link messages to conversations
- Track sender information
- Mark admin messages

#### 4. `project_descriptions` Table

Caches project descriptions (GitHub and OpenAI-generated).

```sql
CREATE TABLE project_descriptions (
  repo_name VARCHAR(255) PRIMARY KEY,
  description TEXT NOT NULL,
  is_auto_generated BOOLEAN DEFAULT FALSE,    -- OpenAI generated?
  source VARCHAR(50) DEFAULT 'github',        -- 'github' or 'openai'
  regenerate_flag BOOLEAN DEFAULT FALSE,      -- Flag for regeneration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_project_descriptions_repo_name` on `repo_name`
- `idx_project_descriptions_regenerate_flag` on `regenerate_flag`

**Purpose:**
- Cache GitHub repository descriptions
- Store OpenAI-generated descriptions
- Allow regeneration of descriptions
- Reduce API calls

### Database Functions

#### `initializeDatabase()`

Creates all tables and indexes if they don't exist. Called on server startup.

#### `logUserLogin(userId, userName, userAvatar, ipAddress)`

Logs or updates user login information. Creates new user if doesn't exist.

#### `isUserBlocked(userId)`

Checks if a user is blocked. Returns boolean.

#### `getOrCreateConversation(userId, userName, userAvatar)`

Gets existing conversation or creates new one. Returns `{ conversation, isNew }`.

#### `getProjectDescription(repoName)`

Retrieves cached project description from database.

#### `saveProjectDescription(repoName, description, isAutoGenerated, source)`

Saves or updates project description in cache.

#### `markForRegeneration(repoName)`

Marks a project description for regeneration by OpenAI.

### Connection Pool

```typescript
export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'myhub',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,   // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Timeout on connection
});
```

---

## API Documentation

### Base URL

**Development:**
- Frontend: `http://localhost:1500`
- Backend: `http://localhost:1600`
- API: `http://localhost:1600/api` or `http://localhost:1500/myhub/api`

**Production:**
- Frontend: `https://developer.epildevconnect.uk/myhub`
- API: `https://developer.epildevconnect.uk/myhub/api`

### Authentication

Most API endpoints require authentication via Discord OAuth. Authentication is handled via session cookies.

#### Auth Endpoints

##### `GET /auth/discord`

Initiates Discord OAuth flow.

**Response:** Redirects to Discord OAuth

---

##### `GET /auth/callback`

Discord OAuth callback endpoint.

**Query Parameters:**
- `code` (string): OAuth code from Discord

**Response:** Redirects to `/myhub/messages` on success

---

##### `GET /auth/user`

Gets current authenticated user.

**Response:**
```json
{
  "user": {
    "profile": {
      "id": "850726663289700373",
      "username": "epildev",
      "discriminator": "0",
      "avatar": "abc123",
      "email": "user@example.com"
    },
    "accessToken": "..."
  }
}
```

**Error Response (401):**
```json
{
  "user": null
}
```

---

##### `POST /auth/logout`

Logs out current user.

**Response:**
```json
{
  "success": true
}
```

### External API Proxies

All external API calls are proxied through the backend to hide API keys.

#### Lanyard API

##### `GET /api/lanyard/:userId`

Proxies request to Lanyard API for Discord presence.

**Path Parameters:**
- `userId` (string): Discord user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "discord_user": {
      "id": "850726663289700373",
      "username": "epildev",
      "discriminator": "0",
      "avatar": "abc123"
    },
    "discord_status": "online",
    "activities": [...],
    "spotify": {...},
    "listening_to_spotify": true
  }
}
```

**Error Responses:**
- `429`: Rate limit exceeded
- `503`: Service temporarily unavailable
- `500`: Internal server error

---

#### Discord Profile API

##### `GET /api/discord/profile/:userId`

Fetches Discord profile with badges using official Discord API.

**Path Parameters:**
- `userId` (string): Discord user ID

**Response:**
```json
{
  "user": {...},
  "badges": ["active_developer", "hypesquad_online_house_1"],
  "clan": {...},
  "avatar_decoration": {...},
  "avatar_url": "https://cdn.discordapp.com/avatars/...",
  "banner_url": "https://cdn.discordapp.com/banners/..."
}
```

---

#### Last.fm API

##### `GET /api/lastfm/recent`

Fetches recently played track from Last.fm.

**Response:**
```json
{
  "recenttracks": {
    "track": [{
      "name": "Song Name",
      "artist": {"#text": "Artist Name"},
      "album": {"#text": "Album Name"},
      "image": [
        {"#text": "small_url", "size": "small"},
        {"#text": "medium_url", "size": "medium"},
        {"#text": "large_url", "size": "large"},
        {"#text": "extralarge_url", "size": "extralarge"}
      ],
      "@attr": {"nowplaying": "true"}
    }]
  }
}
```

---

#### WakaTime API

##### `GET /api/wakatime/stats`

Fetches coding statistics from WakaTime (last 7 days).

**Response:**
```json
{
  "data": {
    "status": "ok",
    "human_readable_total": "12 hrs 34 mins",
    "total_seconds": 45240,
    "languages": [
      {
        "name": "TypeScript",
        "total_seconds": 18000,
        "percent": 39.78,
        "text": "5 hrs 0 mins"
      }
    ],
    "editors": [...],
    "best_day": {
      "date": "2025-01-15",
      "text": "3 hrs 45 mins"
    }
  }
}
```

---

#### GitHub API

##### `GET /api/github/repos`

Fetches public repositories from GitHub.

**Response:**
```json
{
  "projects": [
    {
      "id": 123456789,
      "title": "My Project",
      "description": "Project description",
      "tech": ["TypeScript", "React", "Node.js"],
      "github": "https://github.com/user/repo",
      "demo": "https://example.com",
      "featured": true,
      "updatedAt": "2025-01-15T10:00:00Z",
      "stars": 42,
      "forks": 5
    }
  ]
}
```

**Features:**
- Auto-filters archived repos
- Auto-filters forks (unless `portfolio` topic)
- Respects `no-portfolio` topic
- Caches results (5 minutes)
- Includes OpenAI-generated descriptions

---

##### `GET /api/github/code-snippets`

Fetches interesting code snippets from repositories.

**Response:**
```json
{
  "snippets": [
    {
      "id": "repo_path",
      "title": "Project - File Path",
      "language": "typescript",
      "code": "...",
      "repo": "repo-name",
      "path": "path/to/file.ts",
      "fullUrl": "https://github.com/user/repo/blob/main/path/to/file.ts"
    }
  ]
}
```

---

#### System Specs API

##### `GET /api/system/specs`

Returns system specifications for VPS and Mac.

**Response:**
```json
{
  "mac": {
    "model": "MacBook Pro 16-inch, 2023",
    "cpu": "Apple M2 Max",
    "ram": "96 GB",
    "storage": "Macintosh HD",
    "os": "Tahoe 26.2"
  },
  "vps": {
    "cpu": "4 vCPU AMD EPYC",
    "cpuCores": 4,
    "cpuModel": "AMD EPYC Processor",
    "cpuUsagePercent": "12.5",
    "ram": "64 GB RAM",
    "ramTotal": 68719476736,
    "ramUsed": 8589934592,
    "ramFree": 60129542144,
    "ramUsedPercent": "12.5",
    "storage": "960 GB NVMe",
    "os": "linux",
    "osRelease": "6.8.0",
    "hostname": "server",
    "nodeVersion": "v20.11.0"
  }
}
```

### Messaging API

All messaging endpoints require authentication.

#### Conversations

##### `GET /api/conversations`

Gets all conversations (admin sees all, users see only their own).

**Response:**
```json
{
  "conversations": [
    {
      "id": 1,
      "user_id": "850726663289700373",
      "user_name": "epildev",
      "user_avatar": "https://...",
      "last_message": "Hello!",
      "last_message_at": "2025-01-15T10:00:00Z",
      "status": "open",
      "created_at": "2025-01-15T09:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "isAdmin": true
}
```

---

##### `GET /api/conversations/:id`

Gets a specific conversation.

**Path Parameters:**
- `id` (integer): Conversation ID

**Response:**
```json
{
  "conversation": {
    "id": 1,
    "user_id": "850726663289700373",
    "user_name": "epildev",
    "user_avatar": "https://...",
    "last_message": "Hello!",
    "last_message_at": "2025-01-15T10:00:00Z",
    "status": "open",
    "created_at": "2025-01-15T09:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

---

##### `POST /api/conversations`

Creates a new conversation (or returns existing).

**Response:**
```json
{
  "conversation": {
    "id": 1,
    "user_id": "850726663289700373",
    "user_name": "epildev",
    "user_avatar": "https://...",
    "status": "open",
    "created_at": "2025-01-15T09:00:00Z",
    "updated_at": "2025-01-15T09:00:00Z"
  }
}
```

---

##### `PATCH /api/conversations/:id/close`

Closes a conversation (admin only).

**Path Parameters:**
- `id` (integer): Conversation ID

**Response:**
```json
{
  "success": true
}
```

---

##### `PATCH /api/conversations/:id/reopen`

Reopens a conversation (admin only).

**Path Parameters:**
- `id` (integer): Conversation ID

**Response:**
```json
{
  "success": true
}
```

---

##### `DELETE /api/conversations/:id`

Deletes a conversation and all messages (admin only).

**Path Parameters:**
- `id` (integer): Conversation ID

**Response:**
```json
{
  "success": true
}
```

#### Messages

##### `GET /api/conversations/:id/messages`

Gets all messages in a conversation.

**Path Parameters:**
- `id` (integer): Conversation ID

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "conversation_id": 1,
      "sender_id": "850726663289700373",
      "sender_name": "epildev",
      "sender_avatar": "https://...",
      "content": "Hello!",
      "is_admin": true,
      "created_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

##### `POST /api/conversations/:id/messages`

Sends a message in a conversation.

**Path Parameters:**
- `id` (integer): Conversation ID

**Request Body:**
```json
{
  "content": "Hello, this is a message!"
}
```

**Response:**
```json
{
  "message": {
    "id": 1,
    "conversation_id": 1,
    "sender_id": "850726663289700373",
    "sender_name": "epildev",
    "sender_avatar": "https://...",
    "content": "Hello, this is a message!",
    "is_admin": true,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

**Rate Limiting:** 10 messages per minute per IP

### Admin API

All admin endpoints require admin authentication.

#### User Management

##### `GET /api/admin/users`

Gets all users (admin only).

**Response:**
```json
{
  "users": [
    {
      "user_id": "850726663289700373",
      "user_name": "epildev",
      "user_avatar": "https://...",
      "ip_address": "192.168.1.1",
      "is_blocked": false,
      "block_reason": null,
      "last_login": "2025-01-15T10:00:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

##### `POST /api/admin/users/:userId/block`

Blocks a user (admin only).

**Path Parameters:**
- `userId` (string): Discord user ID

**Request Body:**
```json
{
  "reason": "Violation of terms"
}
```

**Response:**
```json
{
  "success": true
}
```

---

##### `POST /api/admin/users/:userId/unblock`

Unblocks a user (admin only).

**Path Parameters:**
- `userId` (string): Discord user ID

**Response:**
```json
{
  "success": true
}
```

---

##### `DELETE /api/admin/users/:userId`

Deletes a user and all their data (admin only).

**Path Parameters:**
- `userId` (string): Discord user ID

**Response:**
```json
{
  "success": true
}
```

#### Test Utilities

##### `POST /api/admin/seed-test-messages`

Seeds test messages in admin's conversation (admin only).

**Response:**
```json
{
  "success": true,
  "conversation": {...},
  "messages": [...],
  "message": "Added 6 test messages to your conversation"
}
```

### Contact API

##### `POST /api/contact/discord`

Sends a Discord DM (requires authentication).

**Request Body:**
```json
{
  "message": "Hello, I'd like to get in touch!"
}
```

**Response:**
```json
{
  "success": true,
  "method": "discord"
}
```

**Fallback:** Falls back to email if Discord DM fails

---

##### `POST /api/contact/email`

Sends an email (no authentication required).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "Hello, I'd like to get in touch!"
}
```

**Response:**
```json
{
  "success": true
}
```

**Features:**
- Sends notification email to site owner
- Sends confirmation email to sender
- HTML email templates

### Cache Management

##### `POST /api/cache/clear`

Clears API cache.

**Query Parameters:**
- `pattern` (string, optional): Pattern to match cache keys

**Response:**
```json
{
  "success": true,
  "message": "Cleared 5 cache entries",
  "pattern": "github"
}
```

### Health Check

##### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

### Rate Limiting

- **General API**: 500 requests per 15 minutes per IP
- **Authentication**: 50 requests per 15 minutes per IP
- **Messages**: 10 messages per minute per IP

### Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error message (optional)",
  "details": "Additional details (development only)"
}
```

Common HTTP Status Codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests (Rate Limited)
- `500`: Internal Server Error
- `503`: Service Unavailable

---

## Frontend Architecture

### Component Hierarchy

```
App
├── BootSequence (first visit only)
└── ErrorBoundary
    └── Layout
        ├── ParticleBackground
        ├── Navigation
        ├── SocialLinks
        └── Routes
            ├── Home
            │   ├── DiscordPresence
            │   ├── NowPlaying
            │   ├── WakaTimeStats
            │   ├── ActivityFeed
            │   └── SystemUptime
            ├── Projects
            ├── TechStack
            ├── Experience
            ├── SystemSpecs
            ├── CodeViewer
            ├── Contact
            ├── Messages
            │   ├── ConversationList
            │   └── ChatView
            ├── AdminDashboard
            ├── PrivacyPolicy
            ├── TermsOfService
            └── NotFound
```

### State Management

The application uses React's built-in state management:
- **useState**: Local component state
- **useEffect**: Side effects and data fetching
- **Context API**: (Not currently used, but could be added)
- **Session Storage**: Boot sequence state
- **Local Storage**: Visited flag

### Data Fetching Pattern

```typescript
// Typical data fetching pattern
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await fetchApiData();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
  
  // Polling interval (if needed)
  const interval = setInterval(fetchData, 1000);
  return () => clearInterval(interval);
}, []);
```

### Routing

React Router DOM handles client-side routing:

```typescript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/home" element={<Home />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/tech-stack" element={<TechStack />} />
  <Route path="/system-specs" element={<SystemSpecs />} />
  <Route path="/experience" element={<Experience />} />
  <Route path="/code-viewer" element={<CodeViewer />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/messages" element={<Messages />} />
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/privacy" element={<PrivacyPolicy />} />
  <Route path="/terms" element={<TermsOfService />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

**Base Path:** `/myhub` (configured in `main.tsx` and `vite.config.ts`)

### Styling Approach

1. **Tailwind CSS**: Utility-first CSS framework
2. **Custom CSS Variables**: Defined in `index.css`
3. **Framer Motion**: Animation library
4. **CSS Modules**: (Not used, but supported)

### Key Components

#### Layout Component

Main layout wrapper that includes:
- Navigation sidebar
- Social links panel
- Particle background
- Content area
- Footer

#### Navigation Component

- Desktop: Fixed right sidebar with icons
- Mobile: Hamburger menu with slide-out drawer
- Active route highlighting
- Tooltips on hover

#### ParticleBackground Component

- WebGL canvas with particle system
- Mouse interaction (repulsion)
- Dynamic connections between particles
- Quantum burst effects
- Performance optimized (adaptive particle count)

#### DiscordPresence Component

- Real-time Discord status display
- Activity information (Spotify, games, custom status)
- Avatar with online indicator
- Updates every 1 second

#### ActivityFeed Component

- Combines data from multiple APIs
- Real-time activity stream
- Color-coded by source
- Auto-scrolling

#### Messages Component

- Real-time messaging interface
- Conversation list sidebar
- Chat view with message history
- Admin controls (close, delete, reopen)

### Custom Hooks

Located in `src/utils/hooks.ts`:

- Custom hooks for data fetching
- Polling hooks
- Authentication hooks

### Responsive Design

Breakpoints (Tailwind defaults):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Mobile-first approach:
- Navigation transforms to hamburger menu
- Sidebars stack vertically
- Content adjusts layout
- Touch-friendly targets

---

## Backend Architecture

### Server Setup

```typescript
const app = express();
const PORT = process.env.BACKEND_PORT || 1600;

// Trust proxy (for Cloudflare Tunnel)
app.set('trust proxy', true);

// Middleware
app.use(cors({...}));
app.use(express.json());
app.use(session({...}));
app.use(passport.initialize());
app.use(passport.session());
```

### Middleware Stack

1. **Request Logging**: Logs all incoming requests
2. **CORS**: Cross-Origin Resource Sharing
3. **Body Parser**: JSON body parsing
4. **Session**: Express session management
5. **Passport**: Authentication initialization
6. **Rate Limiting**: Request rate limiting
7. **Static Files**: Serves built frontend
8. **Error Handler**: Global error handling

### Route Organization

Routes are organized by functionality:

1. **Test Routes**: `/test-*` (development)
2. **Auth Routes**: `/auth/*`, `/myhub/auth/*`
3. **Admin Routes**: `/api/admin/*`, `/myhub/api/admin/*`
4. **Conversation Routes**: `/api/conversations/*`
5. **Message Routes**: `/api/conversations/:id/messages`
6. **API Proxy Routes**: `/api/lanyard/*`, `/api/lastfm/*`, etc.
7. **Contact Routes**: `/api/contact/*`
8. **Static Routes**: `/myhub/*` (frontend)
9. **Health Check**: `/health`
10. **Root Redirect**: `/` → `/myhub/home`

### Route Path Handling

The backend handles multiple path patterns:
- `/api/*` - Standard API paths
- `/myhub/api/*` - Cloudflare tunnel paths
- Both patterns point to the same handlers

### Authentication Flow

1. User clicks "Login with Discord"
2. Frontend redirects to `/myhub/auth/discord`
3. Backend initiates Passport Discord strategy
4. User authorizes on Discord
5. Discord redirects to `/myhub/auth/callback`
6. Passport validates and creates session
7. Backend logs user login
8. Backend checks if user is blocked
9. Backend redirects to `/myhub/messages`
10. Frontend receives session cookie
11. Subsequent requests include session cookie

### Session Management

```typescript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  proxy: true,
  name: 'myhub.sid',
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false, // HTTP in tunnel, HTTPS in browser
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  },
}));
```

### Rate Limiting

Three rate limiters:

1. **General API**: 500 requests / 15 minutes
2. **Authentication**: 50 requests / 15 minutes
3. **Messages**: 10 messages / minute

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests...',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});
```

### Caching Strategy

In-memory cache for external API responses:

```typescript
const githubCache = new Map<string, CacheEntry>();

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}
```

**Cache TTLs:**
- GitHub repos: 5 minutes
- GitHub topics/languages: 5 minutes
- GitHub README: 10 minutes
- Code snippets: 10 minutes

**Cache Functions:**
- `getCached(key)`: Get cached data
- `setCached(key, data, ttl)`: Set cache entry
- `clearCache(pattern)`: Clear cache entries

### Error Handling

Global error handler:

```typescript
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
});
```

Error responses follow consistent format:
- Development: Includes stack trace
- Production: Generic error messages

### Discord Bot Integration

Discord bot for notifications:

```typescript
const discordBot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

// Used for:
// - Sending DM notifications for new conversations
// - Sending DM notifications for new messages
// - Contact form Discord DM delivery
```

### Email System

Nodemailer configuration:

```typescript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

**Email Types:**
1. Contact form notifications (to site owner)
2. Contact form confirmations (to sender)
3. Contact form Discord DM fallback

### OpenAI Integration

OpenAI service for project descriptions:

```typescript
// Generates project descriptions for GitHub repos
// Caches results in database
// Detects placeholder descriptions
// Regenerates on demand
```

**Features:**
- Detects placeholder descriptions
- Generates concise descriptions (max 120 chars)
- Caches in database
- Regeneration flag support

---

## Authentication & Security

### Discord OAuth2

**Flow:**
1. User initiates login
2. Redirect to Discord OAuth
3. User authorizes application
4. Discord redirects with code
5. Backend exchanges code for token
6. Backend fetches user profile
7. Session created
8. User authenticated

**Scopes:**
- `identify`: Basic user information
- `email`: User email address

**Session:**
- Stored server-side
- Cookie-based (httpOnly, sameSite: 'lax')
- 24-hour expiration

### User Blocking

Users can be blocked via admin panel:
- Block prevents login
- Block reason stored
- Blocked users redirected on login attempt

### IP Tracking

User IP addresses are logged for security:
- Stored on login
- Used for rate limiting
- Can be used for blocking

### Rate Limiting

Protection against abuse:
- API endpoints: 500 req/15min
- Auth endpoints: 50 req/15min
- Message endpoints: 10 msg/min

### CORS Configuration

```typescript
app.use(cors({
  origin: [
    `http://localhost:${process.env.FRONTEND_PORT || 1500}`,
    'https://developer.epildevconnect.uk'
  ],
  credentials: true,
}));
```

### API Key Protection

All API keys stored server-side:
- Never exposed to frontend
- Environment variables only
- Validated on startup

### Session Security

- HttpOnly cookies (prevents XSS)
- SameSite: 'lax' (prevents CSRF)
- Secure flag in production
- Session secret (random, secure)

### Input Validation

- Request body validation
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)
- CSRF protection (sameSite cookies)

### HTTPS Enforcement

Production uses HTTPS via Cloudflare Tunnel:
- SSL/TLS encryption
- Secure cookies
- HSTS headers (via Cloudflare)

---

## Features & Functionality

### Real-Time Integrations

#### Discord Presence (Lanyard API)

- **Update Frequency**: Every 1 second
- **Data Displayed**:
  - Online status (online, idle, dnd, offline)
  - Current activity (Spotify, games, custom status)
  - Avatar with animated online indicator
  - Custom status message
  - Spotify listening activity (if active)
- **Fallback**: Shows "offline" if API unavailable

#### Last.fm Music Tracking

- **Update Frequency**: Every 1 second
- **Data Displayed**:
  - Currently playing track
  - Artist and album information
  - Album artwork
  - Playback status indicator
- **Fallback**: Shows "Not playing" if no track

#### WakaTime Coding Statistics

- **Update Frequency**: On page load (cached)
- **Data Displayed**:
  - Total coding time (last 7 days)
  - Top languages with percentages
  - Top editors with percentages
  - Best coding day
  - Animated progress bars
- **Fallback**: Shows "No data" if API unavailable

### Messaging System

#### Features

- **Discord OAuth**: Secure authentication
- **Real-Time Updates**: Polling every 3 seconds
- **Conversation Management**: One conversation per user
- **Admin Controls**: Close, reopen, delete conversations
- **User Management**: Block/unblock users
- **Notifications**: Discord DM notifications for admin
- **Message History**: Persistent message storage

#### User Flow

1. User logs in with Discord
2. Conversation created automatically
3. User sends message
4. Admin receives Discord DM notification
5. Admin views conversation in dashboard
6. Admin replies
7. User sees reply in real-time

#### Admin Flow

1. Admin logs in
2. Sees all conversations in sidebar
3. Clicks conversation to view
4. Sends reply
5. User receives reply
6. Can close/reopen/delete conversations

### Project Showcase

#### Features

- **GitHub Integration**: Fetches public repositories
- **Auto-Filtering**: Excludes archived, forks (unless `portfolio` topic)
- **Topic Support**: `portfolio`, `featured`, `no-portfolio` topics
- **Tech Stack Detection**: From topics and languages
- **OpenAI Descriptions**: Auto-generates descriptions for repos without good descriptions
- **Demo Links**: Supports homepage and demo URLs
- **Featured Projects**: Highlighted with badge
- **Sorting**: Featured first, then by update date

#### Description Generation

1. Check GitHub description
2. If placeholder → Check database cache
3. If cached → Use cached description
4. If not cached → Generate with OpenAI
5. Save to database
6. Display description

### Contact System

#### Dual Mode

1. **Logged In Users**: Discord DM (preferred)
2. **Logged Out Users**: Email form

#### Features

- Form validation
- Success/error feedback
- Email confirmation to sender
- Notification email to site owner
- HTML email templates
- Reply-to support

### Admin Dashboard

#### Features

- User management (view, block, unblock, delete)
- Conversation management (view, close, reopen, delete)
- Test message seeding
- User statistics
- Conversation statistics

### System Specifications

#### Features

- **VPS Specs**: Auto-detected (CPU, RAM, storage, OS)
- **Mac Specs**: Configurable via environment variables
- **Real-Time Usage**: CPU and RAM usage percentages
- **Auto-Detection**: CPU model, cores, memory

### Code Viewer

#### Features

- VS Code-style interface
- Syntax highlighting (Prism)
- Multiple code snippets
- Copy to clipboard
- Line numbers
- Language detection

### Particle Background

#### Features

- WebGL canvas rendering
- Interactive particles
- Mouse repulsion effect
- Dynamic connections
- Quantum burst effects
- Performance optimized

### Boot Sequence

#### Features

- Terminal-style animation
- Shows on first visit only
- Skippable with any key
- Cached in localStorage
- System initialization theme

### Auto-Hide on Idle

#### Features

- Detects 60 seconds of inactivity
- Hides sensitive information
- Reveals on user interaction
- Smooth fade animations
- Privacy protection

---

## Configuration & Environment

### Environment Variables

All configuration is done via environment variables in `.env` file.

#### Required Variables

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=myhub
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:1500/myhub/auth/callback
DISCORD_USER_ID=your_discord_user_id
ADMIN_DISCORD_ID=your_discord_user_id

# Discord Bot (optional, for notifications)
DISCORD_BOT_TOKEN=your_bot_token

# Session
SESSION_SECRET=your_random_secret

# Ports
FRONTEND_PORT=1500
BACKEND_PORT=1600
```

#### Optional Variables

```bash
# Last.fm
LASTFM_USERNAME=your_username
LASTFM_API_KEY=your_api_key

# WakaTime
WAKATIME_USERNAME=your_username
WAKATIME_API_KEY=your_api_key

# GitHub
GITHUB_USERNAME=your_username
GITHUB_TOKEN=your_personal_access_token

# OpenAI (for project descriptions)
OPENAI_API_KEY=your_api_key

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
SMTP_FROM_EMAIL=no-reply@example.com

# System Specs (Mac)
MAC_MODEL=MacBook Pro 16-inch, 2023
MAC_CPU=Apple M2 Max
MAC_RAM=96 GB
MAC_STORAGE=Macintosh HD
MAC_OS=Tahoe 26.2

# VPS Specs
VPS_STORAGE=960 GB NVMe

# Social Links (Frontend - VITE_ prefix)
VITE_SOCIAL_GITHUB=https://github.com/username
VITE_SOCIAL_DISCORD=https://discord.com/users/userid
VITE_SOCIAL_LINKEDIN=https://linkedin.com/in/username
```

### Frontend Environment Variables

Frontend variables must be prefixed with `VITE_` to be accessible:

```bash
VITE_SOCIAL_GITHUB=...
VITE_SOCIAL_DISCORD=...
VITE_GITHUB_USERNAME=...
```

### Environment Validation

Use the provided script to validate environment:

```bash
npm run check-env
```

This checks for:
- Required variables
- Valid formats
- Database connectivity
- API connectivity

### Session Secret Generation

Generate a secure session secret:

```bash
npm run generate-secret
```

Or manually:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Development Setup

### Prerequisites

- **Node.js**: 20.x or higher
- **PostgreSQL**: 14.x or higher
- **npm**: 9.x or higher (or yarn/pnpm)
- **Git**: For version control

### Initial Setup

1. **Clone Repository**

```bash
git clone https://github.com/gitEpildev/myhub.git
cd myhub
```

2. **Install Dependencies**

```bash
npm install
```

3. **Setup Environment**

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
nano .env
```

4. **Generate Session Secret**

```bash
npm run generate-secret
# Copy output to SESSION_SECRET in .env
```

5. **Setup Database**

```bash
# Create database
createdb myhub

# Database schema is auto-created on first server start
```

6. **Validate Configuration**

```bash
npm run check-env
```

7. **Start Development Server**

```bash
npm run dev
```

This starts both frontend (port 1500) and backend (port 1600).

### Development Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only (port 1500)
npm run dev:backend      # Start backend only (port 1600)

# Building
npm run build           # Build for production
npm run build:backend   # Build backend TypeScript
npm run preview         # Preview production build

# Type Checking
npm run type-check      # TypeScript validation

# Utilities
npm run setup           # Full setup wizard
npm run check-env       # Validate environment
npm run generate-secret # Generate session secret
```

### Development Workflow

1. **Make Changes**: Edit files in `src/` or `server/`
2. **Hot Reload**: Changes auto-reload (Vite HMR + tsx watch)
3. **Type Check**: Run `npm run type-check` before committing
4. **Test**: Test locally at http://localhost:1500
5. **Commit**: Commit changes with descriptive messages

### Debugging

#### Frontend Debugging

- Use browser DevTools
- React DevTools extension
- Console logging in components
- Network tab for API calls

#### Backend Debugging

- Console logging in routes
- Node.js debugger: `node --inspect server/index.ts`
- VS Code debugger (launch.json)
- Database queries: `psql myhub`

#### Database Debugging

```bash
# Connect to database
psql myhub

# View tables
\dt

# View data
SELECT * FROM users;
SELECT * FROM conversations;
SELECT * FROM messages;

# View indexes
\di
```

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :1500
lsof -i :1600

# Kill process
kill -9 <PID>
```

#### Database Connection Error

- Check PostgreSQL is running
- Verify credentials in `.env`
- Check database exists: `psql -l`

#### API Key Errors

- Verify API keys in `.env`
- Check API key permissions
- Test API keys manually

---

## Deployment Guide

### Production Deployment Options

#### 1. Docker (Recommended)

**Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npm run build:backend
EXPOSE 1600
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "1600:1600"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
  
  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=myhub
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Deploy:**
```bash
docker-compose up -d
docker-compose logs -f
```

#### 2. PM2

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'myhub-backend',
    script: './server/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

**Deploy:**
```bash
npm run build
npm run build:backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Systemd

**myhub.service:**
```ini
[Unit]
Description=MY HUB Backend
After=network.target postgresql.service

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/myhub
ExecStart=/usr/bin/node server/index.js
Environment=NODE_ENV=production
Restart=always

[Install]
WantedBy=multi-user.target
```

**Deploy:**
```bash
sudo cp myhub.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable myhub
sudo systemctl start myhub
```

### Cloudflare Tunnel Setup

1. **Install Cloudflared**

```bash
# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

2. **Authenticate**

```bash
cloudflared tunnel login
```

3. **Create Tunnel**

```bash
cloudflared tunnel create myhub
```

4. **Configure Tunnel**

Edit `cloudflare-tunnel-config.yml`:
```yaml
tunnel: <tunnel-id>
credentials-file: /path/to/cloudflare-credentials.json

ingress:
  - hostname: developer.epildevconnect.uk
    service: http://localhost:1600
  - service: http_status:404
```

5. **Run Tunnel**

```bash
cloudflared tunnel --config cloudflare-tunnel-config.yml run
```

Or as service:
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrated
- [ ] SSL/TLS enabled (Cloudflare)
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Health checks working
- [ ] API keys validated
- [ ] CORS configured
- [ ] Session secret secure
- [ ] Frontend built (`npm run build`)
- [ ] Backend built (`npm run build:backend`)

### Performance Optimization

1. **Frontend**
   - Production build (`npm run build`)
   - Code splitting
   - Asset optimization
   - CDN for static assets

2. **Backend**
   - Database connection pooling
   - API response caching
   - Rate limiting
   - Error handling

3. **Database**
   - Indexes on foreign keys
   - Query optimization
   - Connection pooling
   - Regular VACUUM

---

## Scripts & Utilities

### Available Scripts

#### `scripts/check-env.js`

Validates environment configuration:
- Required variables
- Database connectivity
- API connectivity

**Usage:**
```bash
npm run check-env
```

#### `scripts/generate-session-secret.js`

Generates a secure random session secret.

**Usage:**
```bash
npm run generate-secret
```

#### `scripts/check-github-repos.js`

Tests GitHub repositories endpoint.

**Usage:**
```bash
node scripts/check-github-repos.js
```

#### `scripts/clear-github-cache.js`

Clears GitHub API cache.

**Usage:**
```bash
node scripts/clear-github-cache.js
```

#### `scripts/test-openai-setup.js`

Tests OpenAI integration.

**Usage:**
```bash
node scripts/test-openai-setup.js
```

#### `scripts/download-all-badges.sh`

Downloads Discord badges.

**Usage:**
```bash
bash scripts/download-all-badges.sh
```

#### `scripts/daily-badge-update.sh`

Updates badges daily (cron job).

**Usage:**
```bash
# Add to crontab
0 0 * * * /path/to/scripts/daily-badge-update.sh
```

### Utility Functions

#### Database Utilities

Located in `server/db.ts`:
- `initializeDatabase()`: Create schema
- `logUserLogin()`: Log user login
- `isUserBlocked()`: Check block status
- `getOrCreateConversation()`: Conversation management
- `getProjectDescription()`: Get cached description
- `saveProjectDescription()`: Save description
- `markForRegeneration()`: Mark for regeneration

#### API Utilities

Located in `src/utils/api.ts`:
- `fetchLanyardData()`: Discord presence
- `fetchDiscordProfile()`: Discord profile
- `fetchLastFmData()`: Last.fm data
- `fetchWakaTimeData()`: WakaTime stats
- `fetchGitHubRepos()`: GitHub repositories
- `fetchGitHubCodeSnippets()`: Code snippets
- `fetchSystemSpecs()`: System specs
- `getAuthUser()`: Current user
- `logout()`: Logout user
- `sendDiscordMessage()`: Send DM
- `sendEmail()`: Send email

---

## Troubleshooting

### Common Issues

#### Frontend Not Loading

**Symptoms:** Blank page, 404 errors

**Solutions:**
1. Check frontend is running: `npm run dev:frontend`
2. Check browser console for errors
3. Verify base path in `vite.config.ts`
4. Clear browser cache
5. Check network tab for failed requests

#### Backend Not Starting

**Symptoms:** Server crashes, connection errors

**Solutions:**
1. Check database is running: `psql myhub`
2. Verify environment variables: `npm run check-env`
3. Check port availability: `lsof -i :1600`
4. Review server logs for errors
5. Verify database schema initialized

#### Authentication Not Working

**Symptoms:** Login redirects, session not persisting

**Solutions:**
1. Check Discord OAuth credentials
2. Verify redirect URI matches Discord app settings
3. Check session secret is set
4. Verify cookies are enabled
5. Check CORS configuration
6. Review browser console for errors

#### API Errors

**Symptoms:** 429, 503, 500 errors

**Solutions:**
1. Check API keys are valid
2. Verify rate limits not exceeded
3. Check external API status
4. Review cache configuration
5. Check network connectivity
6. Review server logs

#### Database Errors

**Symptoms:** Connection errors, query failures

**Solutions:**
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Check database exists: `psql -l`
4. Verify schema initialized
5. Check connection pool settings
6. Review database logs

### Debugging Tips

1. **Enable Verbose Logging**
   - Add `console.log()` statements
   - Check browser console
   - Review server logs

2. **Test API Endpoints**
   - Use curl or Postman
   - Test endpoints directly
   - Verify responses

3. **Check Environment**
   - Run `npm run check-env`
   - Verify all variables set
   - Check file permissions

4. **Database Queries**
   - Connect with `psql myhub`
   - Run queries manually
   - Check data integrity

5. **Network Analysis**
   - Use browser DevTools Network tab
   - Check request/response headers
   - Verify CORS headers

### Getting Help

1. Check documentation
2. Review error logs
3. Search existing issues
4. Create detailed bug report
5. Include environment details
6. Provide error messages
7. Include reproduction steps

---

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - Route-based code splitting
   - Lazy loading components
   - Dynamic imports

2. **Asset Optimization**
   - Image optimization
   - Font optimization
   - CSS minification
   - JavaScript minification

3. **Caching**
   - Browser caching
   - Service workers (future)
   - CDN caching

4. **Bundle Size**
   - Tree shaking
   - Dead code elimination
   - Dependency optimization

### Backend Optimization

1. **Database**
   - Connection pooling
   - Query optimization
   - Indexes on foreign keys
   - Prepared statements

2. **Caching**
   - API response caching
   - Database query caching
   - In-memory cache

3. **Rate Limiting**
   - Prevent abuse
   - Protect resources
   - Fair usage

4. **Error Handling**
   - Graceful degradation
   - Error recovery
   - Logging

### Monitoring

1. **Application Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Uptime monitoring

2. **Database Monitoring**
   - Query performance
   - Connection pool usage
   - Database size

3. **API Monitoring**
   - Response times
   - Error rates
   - Rate limit usage

---

## Future Roadmap

### Planned Features

- [ ] WebSocket support for real-time updates
- [ ] GraphQL API alternative
- [ ] Admin panel enhancements
- [ ] Blog section with MDX
- [ ] Analytics dashboard
- [ ] Redis caching layer
- [ ] Automated testing (Jest/Vitest)
- [ ] E2E tests (Playwright/Cypress)
- [ ] GitHub Actions CI/CD
- [ ] Monitoring with Sentry
- [ ] Performance tracking
- [ ] A/B testing capability
- [ ] Multi-language support
- [ ] Theme customization panel
- [ ] Mobile app (React Native)
- [ ] PWA support
- [ ] Offline mode enhancements

### Technical Improvements

- [ ] TypeScript strict mode
- [ ] Unit test coverage > 80%
- [ ] E2E test coverage
- [ ] Performance budget enforcement
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] SEO optimization
- [ ] Meta tags management
- [ ] Sitemap generation
- [ ] RSS feed
- [ ] API versioning
- [ ] OpenAPI/Swagger documentation

---

## Conclusion

MY HUB is a comprehensive, production-ready full-stack application demonstrating modern web development practices. It combines real-time data integration, modern UI/UX design, secure authentication, and robust architecture to create a compelling personal dashboard experience.

### Key Achievements

- ✅ Full-stack TypeScript application
- ✅ Real-time API integrations
- ✅ Secure authentication system
- ✅ Production-ready deployment
- ✅ Comprehensive documentation
- ✅ Modern UI/UX design
- ✅ Robust error handling
- ✅ Performance optimization

### Technologies Demonstrated

- React 18 with TypeScript
- Node.js + Express backend
- PostgreSQL database
- Discord OAuth2
- External API integration
- Docker containerization
- Cloudflare Tunnel deployment
- Modern CSS (Tailwind)
- Animation libraries (Framer Motion)
- 3D graphics (Three.js)

---

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained By**: @epildev  
**Project Repository**: https://github.com/gitEpildev/myhub  
**Live Site**: https://developer.epildevconnect.uk/myhub/

---

*This documentation is comprehensive and covers all aspects of the MY HUB project. For specific guides, see the [Documentation Index](DOCUMENTATION_INDEX.md).*
