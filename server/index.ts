import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import os from 'os';
import { execSync } from 'child_process';
import { Client, GatewayIntentBits } from 'discord.js';
import { pool, initializeDatabase, getOrCreateConversation, logUserLogin, isUserBlocked, getProjectDescription, saveProjectDescription } from './db.js';
import { generateProjectDescription, isPlaceholderDescription } from './services/openai.js';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 1600;

// Discord Bot Client (declared early so routes can use it)
let discordBot: Client | null = null;

// Trust proxy - Required for Cloudflare Tunnel
app.set('trust proxy', true);

// Middleware
app.use(cors({
  origin: [
    `http://localhost:${process.env.FRONTEND_PORT || 1500}`,
    'https://developer.epildevconnect.uk'
  ],
  credentials: true,
}));
app.use(express.json());

// Rate limiting (configured for Cloudflare Tunnel)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window (increased for dashboard polling)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }, // Disable validation since we're behind Cloudflare
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 messages per minute
  message: 'Too many messages sent, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
});

// CRITICAL: Log ALL requests to debug routing issues
app.use((req, res, next) => {
  console.log('[BACKEND] Request received:', req.method, 'path:', req.path, 'originalUrl:', req.originalUrl, 'url:', req.url);
  next();
});

app.use('/api/', limiter);
app.use('/auth/', authLimiter);

// CRITICAL: Declare apiRouter EARLY (before any routes that use it)
// This allows handlers to register routes on it even if they're defined earlier
const apiRouter = express.Router();

// Simple in-memory cache for GitHub API responses (to reduce rate limiting)
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const githubCache = new Map<string, CacheEntry>();
const GITHUB_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

function getCached(key: string): any | null {
  const entry = githubCache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    githubCache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCached(key: string, data: any, ttl: number = GITHUB_CACHE_TTL): void {
  githubCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

function clearCache(pattern?: string): number {
  if (!pattern) {
    const count = githubCache.size;
    githubCache.clear();
    console.log(`[BACKEND] Cleared all ${count} cache entries`);
    return count;
  }
  
  let count = 0;
  for (const key of githubCache.keys()) {
    if (key.includes(pattern)) {
      githubCache.delete(key);
      count++;
    }
  }
  console.log(`[BACKEND] Cleared ${count} cache entries matching "${pattern}"`);
  return count;
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'epildevconnect-secret-key',
  resave: true, // Changed to true to ensure session is saved on every request
  saveUninitialized: false,
  proxy: true, // Trust proxy for session cookies
  name: 'myhub.sid', // Custom session name to avoid conflicts
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false, // Cloudflare tunnel presents as HTTP to backend, but HTTPS to browser
    httpOnly: true,
    sameSite: 'lax', // Use 'lax' for same-site cookies
    path: '/', // Keep path as root to work across all routes
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// TEST: Route at the very top to verify routing works
app.get('/test-top-route', (req, res) => {
  console.log('[BACKEND] TOP TEST ROUTE MATCHED!');
  res.json({ success: true, message: 'Top route working!' });
});

// Discord OAuth Configuration
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  const callbackURL = process.env.DISCORD_REDIRECT_URI || 'http://localhost:1500/auth/callback';
  console.log('[Auth] Discord OAuth configured with callbackURL:', callbackURL);
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['identify', 'email'],
  }, (accessToken: string, refreshToken: string, profile: any, done: any) => {
    return done(null, { profile, accessToken });
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj: any, done) => {
    done(null, obj);
  });
}

// Nodemailer Configuration
// Authenticate as no-reply@ if SMTP_FROM_EMAIL is set (same password), otherwise use SMTP_USER
const smtpAuthUser = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: smtpAuthUser, // Authenticate as no-reply@ since password is the same
    pass: process.env.SMTP_PASS,
  },
});

// Auth Routes (supporting both /auth and /myhub/auth paths)
const authCallbackHandler = async (req: any, res: any) => {
  try {
    const user = (req.user as any)?.profile;
    if (user) {
      const userId = user.id;
      const userName = user.username || user.global_name || 'Unknown';
      const userAvatar = user.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` : null;
      
      // Get user's IP address
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                       req.socket.remoteAddress || 
                       'Unknown';
      
      // Log user login
      await logUserLogin(userId, userName, userAvatar, ipAddress);
      
      // Check if user is blocked
      const blocked = await isUserBlocked(userId);
      if (blocked) {
        req.logout(() => {
          res.redirect('https://developer.epildevconnect.uk/?error=blocked');
        });
        return;
      }
    }
    
    // Check if already redirected to prevent loops
    if ((req.session as any)?.authRedirected) {
      console.log('[Auth] Already redirected, preventing loop');
      return res.redirect('https://developer.epildevconnect.uk/messages');
    }
    
    // Mark as redirected to prevent loops
    (req.session as any).authRedirected = true;
    
    // Save session synchronously before redirect
    console.log('[Auth] Session ID:', req.sessionID);
    console.log('[Auth] User authenticated:', req.isAuthenticated());
    console.log('[Auth] User:', (req.user as any)?.profile?.username);
    
    // Manually save session and wait for it to complete
    await new Promise<void>((resolve, reject) => {
      req.session.save((err: any) => {
        if (err) {
          console.error('[Auth] Session save error:', err);
          reject(err);
        } else {
          console.log('[Auth] Session saved successfully');
          resolve();
        }
      });
    });
    
    // Set cookie explicitly
    res.cookie('myhub.sid', req.sessionID, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    console.log('[Auth] Cookie set:', req.sessionID);
    
    // Redirect to messages page ONCE
    res.redirect('https://developer.epildevconnect.uk/messages');
  } catch (error) {
    console.error('Error in auth callback:', error);
    // Clear the redirect flag on error
    if (req.session) {
      (req.session as any).authRedirected = false;
    }
    res.redirect('https://developer.epildevconnect.uk/messages');
  }
};

// Register routes for both /auth and /myhub/auth paths
app.get('/auth/discord', (req, res, next) => {
  console.log('[Auth] Initiating Discord OAuth flow');
  passport.authenticate('discord')(req, res, next);
});
app.get('/auth/discord', (req, res, next) => {
  console.log('[Auth] Initiating Discord OAuth flow (myhub path)');
  passport.authenticate('discord')(req, res, next);
});

app.get('/auth/callback',
  (req, res, next) => {
    // Check if already processed to prevent loops
    if ((req.session as any)?.authRedirected) {
      console.log('[Auth] Callback already processed, redirecting to messages');
      return res.redirect('https://developer.epildevconnect.uk/messages');
    }
    next();
  },
  passport.authenticate('discord', { failureRedirect: 'https://developer.epildevconnect.uk/' }),
  (req, res, next) => {
    console.log('[Auth] Discord callback received, user:', (req.user as any)?.profile?.username);
    console.log('[Auth] Session ID:', req.sessionID);
    console.log('[Auth] Is Authenticated:', req.isAuthenticated());
    authCallbackHandler(req, res).catch((err) => {
      console.error('[Auth] Callback handler error:', err);
      res.redirect('https://developer.epildevconnect.uk/messages');
    });
  }
);
app.get('/auth/callback',
  (req, res, next) => {
    // Check if already processed to prevent loops
    if ((req.session as any)?.authRedirected) {
      console.log('[Auth] Callback already processed, redirecting to messages');
      return res.redirect('https://developer.epildevconnect.uk/messages');
    }
    next();
  },
  passport.authenticate('discord', { failureRedirect: 'https://developer.epildevconnect.uk/' }),
  (req, res, next) => {
    console.log('[Auth] Discord callback received (myhub path), user:', (req.user as any)?.profile?.username);
    console.log('[Auth] Session ID:', req.sessionID);
    console.log('[Auth] Is Authenticated:', req.isAuthenticated());
    authCallbackHandler(req, res).catch((err) => {
      console.error('[Auth] Callback handler error:', err);
      res.redirect('https://developer.epildevconnect.uk/messages');
    });
  }
);

const authUserHandler = (req: any, res: any) => {
  console.log('[Auth] /auth/user request - Session ID:', req.sessionID);
  console.log('[Auth] Is Authenticated:', req.isAuthenticated());
  console.log('[Auth] User:', req.user ? (req.user as any)?.profile?.username : 'null');
  console.log('[Auth] Cookie header:', req.headers.cookie ? 'Present' : 'Missing');
  
  // Always try to save/touch session if it exists
  if (req.session && req.sessionID) {
    req.session.touch(); // Refresh session expiry
    req.session.save(); // Save session changes
  }
  
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
};

const logoutHandler = (req: any, res: any) => {
  req.logout(() => {
    res.json({ success: true });
  });
};

app.get('/auth/user', authUserHandler);
app.get('/auth/user', authUserHandler);
// Also register on /myhub/api/* path since frontend uses /myhub/api baseURL
app.get('/api/auth/user', authUserHandler);

app.post('/auth/logout', logoutHandler);
app.post('/auth/logout', logoutHandler);
app.post('/api/auth/logout', logoutHandler);

// Middleware to check if user is admin
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userId = (req.user as any)?.profile?.id;
  const adminId = process.env.ADMIN_DISCORD_ID;
  
  if (userId === adminId) {
    return next();
  }
  
  res.status(403).json({ error: 'Forbidden: Admin access required' });
};

// Middleware to check if user is authenticated and not blocked
const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Check if user is blocked
  const userId = (req.user as any)?.profile?.id;
  if (userId) {
    const blocked = await isUserBlocked(userId);
    if (blocked) {
      req.logout(() => {});
      return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
    }
  }
  
  next();
};

// ========================================
// ADMIN USER MANAGEMENT API ENDPOINTS
// ========================================

// Get all users (admin only)
const handleAdminUsers = async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query(
      'SELECT user_id, user_name, user_avatar, ip_address, is_blocked, block_reason, last_login, created_at FROM users ORDER BY last_login DESC'
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Register admin users route
app.get('/api/admin/users', isAdmin, handleAdminUsers);
app.get('/api/admin/users', isAdmin, handleAdminUsers);

// Block a user (admin only)
const handleBlockUser = async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    await pool.query(
      'UPDATE users SET is_blocked = TRUE, block_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [reason || 'No reason provided', userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
};

app.post('/api/admin/users/:userId/block', isAdmin, handleBlockUser);
app.post('/api/admin/users/:userId/block', isAdmin, handleBlockUser);

// Unblock a user (admin only)
const handleUnblockUser = async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    
    await pool.query(
      'UPDATE users SET is_blocked = FALSE, block_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
};

app.post('/api/admin/users/:userId/unblock', isAdmin, handleUnblockUser);
app.post('/api/admin/users/:userId/unblock', isAdmin, handleUnblockUser);

// Delete a user and all their data (admin only)
const handleDeleteUser = async (req: express.Request, res: express.Response) => {
  try {
    const { userId } = req.params;
    
    // Delete user's messages first (cascade should handle this, but being explicit)
    await pool.query('DELETE FROM messages WHERE sender_id = $1', [userId]);
    
    // Delete user's conversations
    await pool.query('DELETE FROM conversations WHERE user_id = $1', [userId]);
    
    // Delete user
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

app.delete('/api/admin/users/:userId', isAdmin, handleDeleteUser);
app.delete('/api/admin/users/:userId', isAdmin, handleDeleteUser);

// ========================================
// CONVERSATION & MESSAGE API ENDPOINTS
// ========================================

// Get all conversations handler
const handleGetConversations = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req.user as any)?.profile?.id;
    const adminId = process.env.ADMIN_DISCORD_ID;
    const isUserAdmin = userId === adminId;

    let query = 'SELECT * FROM conversations';
    let params: any[] = [];

    if (!isUserAdmin) {
      // Regular users only see their own conversation
      query += ' WHERE user_id = $1';
      params = [userId];
    }

    query += ' ORDER BY last_message_at DESC';

    const result = await pool.query(query, params);
    res.json({ conversations: result.rows, isAdmin: isUserAdmin });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

app.get('/api/conversations', isAuthenticated, handleGetConversations);
app.get('/api/conversations', isAuthenticated, handleGetConversations);

// Get a specific conversation handler
const handleGetConversation = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.profile?.id;
    const adminId = process.env.ADMIN_DISCORD_ID;
    const isUserAdmin = userId === adminId;

    const result = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = result.rows[0];

    // Check permissions: admin can see all, users can only see their own
    if (!isUserAdmin && conversation.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

app.get('/api/conversations/:id', isAuthenticated, handleGetConversation);
app.get('/api/conversations/:id', isAuthenticated, handleGetConversation);

// Get messages for a conversation handler
const handleGetMessages = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.profile?.id;
    const adminId = process.env.ADMIN_DISCORD_ID;
    const isUserAdmin = userId === adminId;

    // First check if user has permission to view this conversation
    const convResult = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
    
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = convResult.rows[0];

    if (!isUserAdmin && conversation.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Fetch messages
    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.json({ messages: messagesResult.rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

app.get('/api/conversations/:id/messages', isAuthenticated, handleGetMessages);
app.get('/api/conversations/:id/messages', isAuthenticated, handleGetMessages);

// Send a message handler
const handleSendMessage = async (req: express.Request, res: express.Response) => {
  try {
    console.log('[SendMessage] Request received, path:', req.path);
    console.log('[SendMessage] User authenticated:', req.isAuthenticated());
    console.log('[SendMessage] User:', (req.user as any)?.profile?.username);
    
    const { id } = req.params;
    const { content } = req.body;
    
    console.log('[SendMessage] Conversation ID:', id);
    console.log('[SendMessage] Content:', content);
    
    const user = (req.user as any)?.profile;
    if (!user) {
      console.error('[SendMessage] No user in request');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const userId = user?.id;
    const userName = user?.username || user?.global_name || 'Unknown';
    const userAvatar = user?.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` : null;
    const adminId = process.env.ADMIN_DISCORD_ID;
    const isUserAdmin = userId === adminId;

    if (!content || content.trim() === '') {
      console.error('[SendMessage] Empty content');
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if user has permission to send to this conversation
    const convResult = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
    
    if (convResult.rows.length === 0) {
      console.error('[SendMessage] Conversation not found:', id);
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = convResult.rows[0];
    console.log('[SendMessage] Conversation user_id:', conversation.user_id, 'Request userId:', userId);

    if (!isUserAdmin && conversation.user_id !== userId) {
      console.error('[SendMessage] Permission denied - user mismatch');
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if this is the first message in the conversation (for non-admin users)
    const messageCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1',
      [id]
    );
    const isFirstMessage = parseInt(messageCountResult.rows[0].count) === 0;

    // Insert message
    console.log('[SendMessage] Inserting message...');
    const messageResult = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, sender_name, sender_avatar, content, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, userId, userName, userAvatar, content, isUserAdmin]
    );

    console.log('[SendMessage] Message inserted:', messageResult.rows[0].id);

    // Update conversation's last message
    await pool.query(
      `UPDATE conversations
       SET last_message = $1, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [content, id]
    );

    // Send Discord DM notification when a non-admin user sends their first message
    if (!isUserAdmin && isFirstMessage && discordBot && discordBot.user) {
      try {
        const adminUserId = process.env.ADMIN_DISCORD_ID;
        if (adminUserId) {
          const adminUser = await discordBot.users.fetch(adminUserId);
          const conversationUrl = `https://developer.epildevconnect.uk/messages`;
          await adminUser.send(
            `💬 **New Message in Conversation**\n\n` +
            `**From:** ${userName} (${userId})\n` +
            `**Conversation ID:** ${id}\n` +
            `**Message:** ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n\n` +
            `**View:** ${conversationUrl}`
          );
          console.log(`[Discord] Sent new message notification from ${userName}`);
        }
      } catch (dmError: any) {
        console.error('[Discord] Failed to send new message notification:', dmError.message);
        // Don't fail the request if Discord DM fails
      }
    }

    console.log('[SendMessage] Success - returning message');
    res.json({ message: messageResult.rows[0] });
  } catch (error: any) {
    console.error('[SendMessage] Error sending message:', error?.message, error?.stack);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Register on both app and apiRouter to ensure they're matched
apiRouter.post('/conversations/:id/messages', messageLimiter, isAuthenticated, handleSendMessage);
app.post('/api/conversations/:id/messages', messageLimiter, isAuthenticated, handleSendMessage);
app.post('/api/conversations/:id/messages', messageLimiter, isAuthenticated, handleSendMessage);

// Create a new conversation handler (or get existing)
const handleCreateConversation = async (req: express.Request, res: express.Response) => {
  try {
    const user = (req.user as any)?.profile;
    const userId = user?.id;
    const userName = user?.username || user?.global_name || 'Unknown';
    const userAvatar = user?.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` : null;
    const adminId = process.env.ADMIN_DISCORD_ID;
    const isUserAdmin = userId === adminId;

    const { conversation, isNew } = await getOrCreateConversation(userId, userName, userAvatar);
    
    // Send Discord DM notification when a NEW conversation is created by a non-admin user
    if (isNew && !isUserAdmin && discordBot && discordBot.user) {
      try {
        if (adminId) {
          const adminUser = await discordBot.users.fetch(adminId);
          const conversationUrl = `https://developer.epildevconnect.uk/messages`;
          await adminUser.send(
            `🔔 **New Conversation Started**\n\n` +
            `**User:** ${userName} (${userId})\n` +
            `**Conversation ID:** ${conversation.id}\n` +
            `**View:** ${conversationUrl}\n\n` +
            `A new help request has been created. Check your admin panel to respond.`
          );
          console.log(`[Discord] Sent new conversation notification for user ${userName}`);
        }
      } catch (dmError: any) {
        console.error('[Discord] Failed to send new conversation notification:', dmError.message);
        // Don't fail the request if Discord DM fails
      }
    }
    
    res.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

app.post('/api/conversations', isAuthenticated, handleCreateConversation);
app.post('/api/conversations', isAuthenticated, handleCreateConversation);

// Delete a conversation handler (admin only)
const handleDeleteConversation = async (req: express.Request, res: express.Response) => {
  try {
    console.log('[DeleteConversation] Request received, path:', req.path);
    console.log('[DeleteConversation] Conversation ID:', req.params.id);
    console.log('[DeleteConversation] User authenticated:', req.isAuthenticated());
    console.log('[DeleteConversation] Is admin:', (req.user as any)?.profile?.id === process.env.ADMIN_DISCORD_ID);
    
    const { id } = req.params;
    
    // Delete all messages first (foreign key constraint)
    await pool.query('DELETE FROM messages WHERE conversation_id = $1', [id]);
    console.log('[DeleteConversation] Messages deleted');
    
    // Then delete the conversation
    await pool.query('DELETE FROM conversations WHERE id = $1', [id]);
    console.log('[DeleteConversation] Conversation deleted successfully');
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('[DeleteConversation] Error:', error?.message, error?.stack);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

// Register on apiRouter as well to ensure they're matched
apiRouter.delete('/conversations/:id', isAdmin, handleDeleteConversation);
app.delete('/api/conversations/:id', isAdmin, handleDeleteConversation);
app.delete('/api/conversations/:id', isAdmin, handleDeleteConversation);

// Close a conversation handler (admin only)
const handleCloseConversation = async (req: express.Request, res: express.Response) => {
  try {
    console.log('[CloseConversation] Request received, path:', req.path);
    console.log('[CloseConversation] Conversation ID:', req.params.id);
    console.log('[CloseConversation] User authenticated:', req.isAuthenticated());
    console.log('[CloseConversation] Is admin:', (req.user as any)?.profile?.id === process.env.ADMIN_DISCORD_ID);
    
    const { id } = req.params;
    
    // Check if conversation uses 'status' or 'is_closed' field
    const convCheck = await pool.query('SELECT * FROM conversations WHERE id = $1 LIMIT 1', [id]);
    if (convCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Try is_closed first (more common), fallback to status
    const hasIsClosed = 'is_closed' in convCheck.rows[0];
    if (hasIsClosed) {
      await pool.query(
        `UPDATE conversations SET is_closed = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
    } else {
      await pool.query(
        `UPDATE conversations SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );
    }
    
    console.log('[CloseConversation] Conversation closed successfully');
    res.json({ success: true });
  } catch (error: any) {
    console.error('[CloseConversation] Error:', error?.message, error?.stack);
    res.status(500).json({ error: 'Failed to close conversation' });
  }
};

// Register on apiRouter as well to ensure they're matched - MUST come before app.use('/myhub/api')
apiRouter.patch('/conversations/:id/close', isAdmin, handleCloseConversation);
app.patch('/api/conversations/:id/close', isAdmin, handleCloseConversation);
app.patch('/api/conversations/:id/close', isAdmin, handleCloseConversation);

// Reopen a conversation handler (admin only)
const handleReopenConversation = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE conversations SET status = 'open', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error reopening conversation:', error);
    res.status(500).json({ error: 'Failed to reopen conversation' });
  }
};

// Register on apiRouter as well to ensure they're matched
apiRouter.patch('/conversations/:id/reopen', isAdmin, handleReopenConversation);
app.patch('/api/conversations/:id/reopen', isAdmin, handleReopenConversation);
app.patch('/api/conversations/:id/reopen', isAdmin, handleReopenConversation);

// Seed test messages (admin only)
const handleSeedTestMessages = async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req.user as any)?.profile?.id;
    const adminId = process.env.ADMIN_DISCORD_ID;
    const isUserAdmin = userId === adminId;

    if (!isUserAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get or create the admin's conversation
    const userName = (req.user as any)?.profile?.username || 'Admin';
    const userAvatar = (req.user as any)?.profile?.avatar 
      ? `https://cdn.discordapp.com/avatars/${userId}/${(req.user as any).profile.avatar}.png` 
      : null;

    const { conversation } = await getOrCreateConversation(userId, userName, userAvatar);

    // Test messages to add
    const testMessages = [
      { content: 'Hello! This is a test message from the admin.', is_admin: true, sender_name: 'epildev' },
      { content: 'Hi there! Testing message functionality here.', is_admin: false, sender_name: userName },
      { content: 'Great! Can you see this message?', is_admin: true, sender_name: 'epildev' },
      { content: 'Yes, I can see it! This is working perfectly.', is_admin: false, sender_name: userName },
      { content: 'Excellent! Try typing a message yourself to test the send functionality.', is_admin: true, sender_name: 'epildev' },
      { content: 'You can also test closing this conversation using the admin controls.', is_admin: true, sender_name: 'epildev' },
    ];

    const insertedMessages = [];
    for (let i = 0; i < testMessages.length; i++) {
      const msg = testMessages[i];
      const minutesAgo = (testMessages.length - i) * 5; // Space messages 5 minutes apart
      const messageResult = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, sender_name, sender_avatar, content, is_admin, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP - INTERVAL '${minutesAgo} minutes')
         RETURNING *`,
        [
          conversation.id,
          userId, // Use same user ID for testing
          msg.sender_name,
          userAvatar,
          msg.content,
          msg.is_admin
        ]
      );
      insertedMessages.push(messageResult.rows[0]);
    }

    // Update conversation's last message
    const lastMessage = testMessages[testMessages.length - 1];
    await pool.query(
      `UPDATE conversations
       SET last_message = $1, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [lastMessage.content, conversation.id]
    );

    res.json({ 
      success: true, 
      conversation: conversation,
      messages: insertedMessages,
      message: `Added ${insertedMessages.length} test messages to your conversation` 
    });
  } catch (error: any) {
    console.error('Error seeding test messages:', error);
    res.status(500).json({ error: 'Failed to seed test messages' });
  }
};

app.post('/api/admin/seed-test-messages', isAuthenticated, handleSeedTestMessages);
app.post('/api/admin/seed-test-messages', isAuthenticated, handleSeedTestMessages);

// API Proxy Routes
// apiRouter is already declared above - now register routes on it

// Lanyard route
const handleLanyard = async (req: express.Request, res: express.Response) => {
  console.log('[BACKEND] Lanyard handler CALLED - userId:', req.params?.userId || 'undefined', 'path:', req.path, 'originalUrl:', req.originalUrl, 'url:', req.url);
  try {
    const { userId } = req.params;
    const response = await axios.get(`https://api.lanyard.rest/v1/users/${userId}`);
    console.log('[BACKEND] Lanyard API success');
    res.json(response.data);
  } catch (error: any) {
    console.error('Lanyard API error:', error?.response?.status, error?.message);
    // Rate limit (429) - don't treat as server error, let frontend handle gracefully
    if (error?.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests to Lanyard API. Please try again later.',
        retryAfter: error?.response?.headers['retry-after'] || 60
      });
    }
    // Network/timeout errors - return 503 (service unavailable) not 500
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT' || error?.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        message: 'Lanyard API is currently unreachable. Using cached data.'
      });
    }
    res.status(500).json({ error: 'Failed to fetch Lanyard data' });
  }
};

// Register routes on router
apiRouter.get('/lanyard/:userId', handleLanyard);

// CRITICAL: Test route to verify route matching works
app.get('/test-api-route', (req, res) => {
  console.log('[BACKEND] TEST route matched!');
  res.json({ test: 'route working' });
});

// Also register directly on app for /myhub/api/* paths BEFORE static middleware
// CRITICAL: These routes MUST be defined before app.use('/myhub', ...) below
// NOTE: System specs route is registered at the top of the file
app.get('/api/lanyard/:userId', (req, res) => {
  console.log('[BACKEND] DIRECT /myhub/api/lanyard route matched! path:', req.path);
  return handleLanyard(req, res);
});

// Discord profile endpoint (badges, banner, etc.) - Official Discord API
const handleDiscordProfile = async (req: express.Request, res: express.Response) => {
  console.log('[BACKEND] /api/discord/profile/:userId hit - userId:', req.params.userId, 'path:', req.path, 'originalUrl:', req.originalUrl);
  try {
    const { userId } = req.params;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (!botToken) {
      return res.status(500).json({ error: 'Discord bot token not configured' });
    }
    
    // Fetch user data from official Discord API
    const userResponse = await axios.get(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'User-Agent': 'Epildevconnect-Site/2.0'
      }
    });
    
    const userData = userResponse.data;
    const publicFlags = userData?.public_flags || 0;
    
    // Decode badge flags
    const badgeFlags: Record<number, string> = {
      1: 'staff',
      2: 'partner',
      4: 'hypesquad',
      8: 'bug_hunter_level_1',
      64: 'hypesquad_online_house_1',
      128: 'hypesquad_online_house_2',
      256: 'hypesquad_online_house_3',
      512: 'premium_early_supporter',
      16384: 'bug_hunter_level_2',
      131072: 'verified_developer',
      262144: 'certified_moderator',
      4194304: 'active_developer'
    };
    
    const badges: string[] = [];
    
    // Detect profile features
    const hasAnimatedBanner = userData.banner?.startsWith('a_');
    const hasAvatarDecoration = userData.avatar_decoration_data != null;
    const hasDisplayNameStyles = userData.display_name_styles != null;
    const hasCollectibles = userData.collectibles != null;
    
    // Add badges in the order they appear on Discord profile (left to right)
    
    // 1. Nitro Gold
    if (hasAnimatedBanner || hasAvatarDecoration || hasDisplayNameStyles || hasCollectibles) {
      badges.push('nitro_gold');
    }
    
    // 2. HypeSquad Bravery (from public_flags)
    if (publicFlags & 64) {
      badges.push('hypesquad_online_house_1');
    }
    
    // 3. Active Developer (from public_flags)
    if (publicFlags & 4194304) {
      badges.push('active_developer');
    }
    
    // 4. Server Booster
    if (hasDisplayNameStyles || hasAvatarDecoration) {
      badges.push('premium_guild_subscriber');
    }
    
    // 5. Completed A Quest
    badges.push('quest_completed');
    
    // 6. Apprentice
    badges.push('apprentice');
    
    // Add any other public_flags badges not already added
    for (const [flag, badgeName] of Object.entries(badgeFlags)) {
      const flagNum = parseInt(flag);
      if ((publicFlags & flagNum) && !badges.includes(badgeName)) {
        badges.push(badgeName);
      }
    }
    
    const response = {
      user: userData,
      badges,
      clan: userData.clan || null,
      avatar_decoration: userData.avatar_decoration_data || null,
      nameplate: userData.collectibles?.nameplate || null,
      avatar_url: userData.avatar 
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator) % 5}.png`,
      banner_url: userData.banner
        ? `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}.png?size=600`
        : null
    };
    
    res.json(response);
  } catch (error: any) {
    console.error('Discord profile API error:', error?.response?.status, error?.message);
    // Rate limit (429) - don't treat as server error
    if (error?.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests to Discord API. Please try again later.',
        retryAfter: error?.response?.headers['retry-after'] || 60
      });
    }
    // Network/timeout errors
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT' || error?.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        message: 'Discord API is currently unreachable. Using cached data.'
      });
    }
    res.status(500).json({ error: 'Failed to fetch Discord profile data' });
  }
};

apiRouter.get('/discord/profile/:userId', handleDiscordProfile);
app.get('/api/discord/profile/:userId', handleDiscordProfile);

const handleLastFm = async (req: express.Request, res: express.Response) => {
  console.log('[BACKEND] /api/lastfm/recent hit - path:', req.path, 'originalUrl:', req.originalUrl, 'method:', req.method);
  try {
    const username = process.env.LASTFM_USERNAME;
    const apiKey = process.env.LASTFM_API_KEY;
    
    if (!username || !apiKey) {
      return res.status(500).json({ error: 'Last.fm credentials not configured' });
    }

    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'user.getrecenttracks',
        user: username,
        api_key: apiKey,
        format: 'json',
        limit: 1,
      },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('Last.fm API error:', error?.response?.status, error?.message);
    // Rate limit (429) - don't treat as server error
    if (error?.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests to Last.fm API. Please try again later.',
        retryAfter: error?.response?.headers['retry-after'] || 60
      });
    }
    // Network/timeout errors
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT' || error?.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        message: 'Last.fm API is currently unreachable. Using cached data.'
      });
    }
    res.status(500).json({ error: 'Failed to fetch Last.fm data' });
  }
};

apiRouter.get('/lastfm/recent', handleLastFm);
app.get('/api/lastfm/recent', handleLastFm);

const handleWakaTime = async (req: express.Request, res: express.Response) => {
  console.log('[BACKEND] /api/wakatime/stats hit - path:', req.path, 'originalUrl:', req.originalUrl, 'method:', req.method);
  try {
    const username = process.env.WAKATIME_USERNAME;
    const apiKey = process.env.WAKATIME_API_KEY;
    
    if (!username || !apiKey) {
      return res.status(500).json({ error: 'WakaTime credentials not configured' });
    }

    // Use summaries endpoint for real-time data (last 7 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await axios.get(
      `https://wakatime.com/api/v1/users/${username}/summaries?start=${startDate}&end=${endDate}&api_key=${apiKey}`
    );
    
    // Transform summaries data to match the stats format
    const summaries = response.data.data || [];
    const languages = {};
    let totalSeconds = 0;
    let bestDay = null;
    let bestDaySeconds = 0;

    const editors: any = {};

    summaries.forEach((day: any) => {
      const dayTotal = day.grand_total?.total_seconds || 0;
      totalSeconds += dayTotal;
      
      if (dayTotal > bestDaySeconds) {
        bestDaySeconds = dayTotal;
        bestDay = {
          date: day.range.date,
          text: day.grand_total?.text || '0 secs'
        };
      }

      day.languages?.forEach((lang: any) => {
        if (!languages[lang.name]) {
          languages[lang.name] = { name: lang.name, total_seconds: 0 };
        }
        languages[lang.name].total_seconds += lang.total_seconds || 0;
      });

      // Aggregate editor data
      day.editors?.forEach((editor: any) => {
        if (!editors[editor.name]) {
          editors[editor.name] = { name: editor.name, total_seconds: 0 };
        }
        editors[editor.name].total_seconds += editor.total_seconds || 0;
      });
    });

    const realLangs = (Object.values(languages) as any[])
      .filter((l) => l.name !== 'Other' && l.total_seconds >= 60);
    const realTotal = realLangs.reduce((sum: number, l: any) => sum + l.total_seconds, 0) as number;
    const languageArray = realLangs
      .sort((a: any, b: any) => b.total_seconds - a.total_seconds)
      .map((lang: any) => ({
        name: lang.name,
        total_seconds: lang.total_seconds,
        percent: realTotal > 0 ? Math.round((lang.total_seconds / realTotal) * 100 * 100) / 100 : 0,
        text: formatDuration(lang.total_seconds)
      }));

    const editorArray = Object.values(editors)
      .sort((a: any, b: any) => b.total_seconds - a.total_seconds)
      .map((editor: any) => ({
        name: editor.name,
        total_seconds: editor.total_seconds,
        percent: totalSeconds > 0 ? Math.round((editor.total_seconds / totalSeconds) * 100 * 100) / 100 : 0,
        text: formatDuration(editor.total_seconds)
      }));

    const codingSeconds = (Object.values(languages) as any[])
      .filter((l) => l.name !== 'Other')
      .reduce((sum: number, l: any) => sum + l.total_seconds, 0) as number;
    const displaySeconds = codingSeconds > 0 ? codingSeconds : totalSeconds;
    const hours = Math.floor(displaySeconds / 3600);
    const mins = Math.floor((displaySeconds % 3600) / 60);
    const humanReadableTotal = hours > 0 ? `${hours} hrs ${mins} mins` : `${mins} mins`;

    res.json({
      data: {
        status: 'ok',
        human_readable_total: humanReadableTotal,
        total_seconds: totalSeconds,
        languages: languageArray,
        editors: editorArray,
        best_day: bestDay,
        is_coding_activity_visible: true,
        is_language_usage_visible: true,
        is_editor_usage_visible: true
      }
    });
  } catch (error: any) {
    console.error('WakaTime API error:', error?.response?.status, error?.message);
    // Rate limit (429) - don't treat as server error
    if (error?.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Too many requests to WakaTime API. Please try again later.',
        retryAfter: error?.response?.headers['retry-after'] || 60
      });
    }
    // Network/timeout errors
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT' || error?.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        message: 'WakaTime API is currently unreachable. Using cached data.'
      });
    }
    res.status(500).json({ error: 'Failed to fetch WakaTime data' });
  }
};

apiRouter.get('/wakatime/stats', handleWakaTime);
app.get('/api/wakatime/stats', handleWakaTime);

// GitHub repositories: builds the full project list from the GitHub API.
// Used by the handler below with stale-while-revalidate caching.
async function buildGitHubReposData(): Promise<any> {
    const githubUsername = process.env.GITHUB_USERNAME || 'gitEpildev';
    const githubToken = process.env.GITHUB_TOKEN; // Optional, for higher rate limits
    
    if (!githubToken) {
      console.warn('[BACKEND] ⚠️ GITHUB_TOKEN not set! Rate limits will be lower (60 requests/hour vs 5000/hour with token)');
    }
    
    const headers: any = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Epildevconnect-Site/2.0'
    };
    
    // Topics endpoint requires different Accept header
    const topicsHeaders: any = {
      'Accept': 'application/vnd.github.mercy-preview+json',
      'User-Agent': 'Epildevconnect-Site/2.0'
    };
    
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
      topicsHeaders['Authorization'] = `token ${githubToken}`;
    }
    
    // Fetch public repositories
    const response = await axios.get(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100&type=public`,
      { headers }
    );
    
    const repos = response.data || [];
    console.log(`[BACKEND] Fetched ${repos.length} repositories from GitHub`);
    
    // Fetch topics and languages for each repository (GitHub API requires separate calls)
    // Add small delay between requests to avoid rate limiting
    const reposWithTopics = await Promise.all(
      repos.map(async (repo: any, index: number) => {
        // Add delay to avoid hitting rate limits too quickly
        if (index > 0 && index % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay every 5 repos
        }
        
        try {
          // Check cache for topics
          const topicsCacheKey = `github_topics_${repo.name}`;
          let topics = getCached(topicsCacheKey);
          
          if (!topics) {
            const topicsResponse = await axios.get(
              `https://api.github.com/repos/${githubUsername}/${repo.name}/topics`,
              { headers: topicsHeaders }
            );
            topics = topicsResponse.data?.names || [];
            setCached(topicsCacheKey, topics);
          }
          
          repo.topics = topics;
          if (repo.topics.length > 0) {
            console.log(`[BACKEND] Repo ${repo.name} has topics:`, repo.topics.join(', '));
          }
        } catch (err: any) {
          // If topics fetch fails, continue without topics
          if (err?.response?.status === 403 || err?.response?.status === 429) {
            console.warn(`[BACKEND] Rate limited while fetching topics for ${repo.name}`);
          } else {
            console.warn(`[BACKEND] Failed to fetch topics for ${repo.name}:`, err?.response?.status || err?.message);
          }
          repo.topics = [];
        }
        
        try {
          // Check cache for languages
          const languagesCacheKey = `github_languages_${repo.name}`;
          let languages = getCached(languagesCacheKey);
          
          if (!languages) {
            const languagesResponse = await axios.get(
              `https://api.github.com/repos/${githubUsername}/${repo.name}/languages`,
              { headers }
            );
            languages = languagesResponse.data || {};
            setCached(languagesCacheKey, languages);
          }
          
          repo.languages = languages;
          const languageNames = Object.keys(repo.languages);
          if (languageNames.length > 0) {
            console.log(`[BACKEND] Repo ${repo.name} has languages:`, languageNames.join(', '));
          }
        } catch (err: any) {
          // If languages fetch fails, continue without languages
          if (err?.response?.status === 403 || err?.response?.status === 429) {
            console.warn(`[BACKEND] Rate limited while fetching languages for ${repo.name}`);
          } else {
            console.warn(`[BACKEND] Failed to fetch languages for ${repo.name}:`, err?.response?.status || err?.message);
          }
          repo.languages = {};
        }
        
        // Fetch README for OpenAI context (optional, don't fail if missing)
        try {
          const readmeCacheKey = `github_readme_${repo.name}`;
          let readmeContent = getCached(readmeCacheKey);
          
          if (!readmeContent) {
            const readmeResponse = await axios.get(
              `https://api.github.com/repos/${githubUsername}/${repo.name}/readme`,
              { headers }
            );
            
            if (readmeResponse.data?.content) {
              // Decode base64 content and extract first 500 characters
              const fullContent = Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8');
              readmeContent = fullContent.substring(0, 500).replace(/\n/g, ' ').trim();
              setCached(readmeCacheKey, readmeContent, 10 * 60 * 1000); // 10 minutes cache
            }
          }
          
          repo.readmeExcerpt = readmeContent || undefined;
        } catch (err: any) {
          // README is optional, continue without it
          if (err?.response?.status !== 404) {
            // Only log non-404 errors (404 means no README, which is fine)
            if (err?.response?.status !== 403 && err?.response?.status !== 429) {
              console.warn(`[BACKEND] Failed to fetch README for ${repo.name}:`, err?.response?.status || err?.message);
            }
          }
          repo.readmeExcerpt = undefined;
        }
        
        return repo;
      })
    );
    
    // Filter repositories - AUTO-INCLUDE all qualifying repos
    const filteredRepos = reposWithTopics.filter((repo: any) => {
      // Inclusion logic:
      // 1. INCLUDE all non-archived, non-fork, public repos by default
      // 2. INCLUDE forks if they have the "portfolio" topic (explicit opt-in for forks)
      // 3. EXCLUDE repos with "no-portfolio" topic (explicit opt-out)
      // 4. EXCLUDE archived repos always
      
      const hasPortfolioTopic = repo.topics && repo.topics.includes('portfolio');
      const hasNoPortfolioTopic = repo.topics && repo.topics.includes('no-portfolio');
      
      // Explicit exclusion takes priority
      if (hasNoPortfolioTopic) {
        console.log(`[BACKEND] Excluding repo ${repo.name}: has 'no-portfolio' topic`);
        return false;
      }
      
      // Archived repos are always excluded
      if (repo.archived) {
        console.log(`[BACKEND] Excluding repo ${repo.name}: archived`);
        return false;
      }
      
      // Forks are excluded unless they have 'portfolio' topic
      if (repo.fork && !hasPortfolioTopic) {
        console.log(`[BACKEND] Excluding repo ${repo.name}: fork without 'portfolio' topic`);
        return false;
      }
      
      // All other repos are included
      console.log(`[BACKEND] Including repo ${repo.name}: fork=${repo.fork}, hasPortfolio=${hasPortfolioTopic}`);
      return true;
    });
    
    // Map repositories to project format (async operations require Promise.all)
    const projects = await Promise.all(
      filteredRepos.map(async (repo: any) => {
        // Extract tech stack from topics (common tech topics)
        const techTopics = [
          'react', 'typescript', 'javascript', 'nodejs', 'python', 'java', 'go', 'rust',
          'vue', 'angular', 'svelte', 'nextjs', 'express', 'fastapi', 'django', 'flask',
          'tailwindcss', 'css', 'html', 'mongodb', 'postgresql', 'mysql', 'redis',
          'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'graphql', 'rest'
        ];
        
        const tech: string[] = [];
        
        // First, add tech from topics
        (repo.topics || []).forEach((topic: string) => {
          if (techTopics.includes(topic.toLowerCase())) {
            const formatted = topic
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            tech.push(formatted);
          }
        });
        
        // Then, add all languages from the languages API (sorted by bytes, descending)
        if (repo.languages && Object.keys(repo.languages).length > 0) {
          const languages = Object.entries(repo.languages)
            .sort(([, a]: [string, any], [, b]: [string, any]) => (b as number) - (a as number))
            .map(([lang]: [string, any]) => lang);
          
          languages.forEach((lang: string) => {
            // Don't add duplicates, and format language names nicely
            const formatted = lang
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            if (!tech.includes(formatted)) {
              tech.push(formatted);
            }
          });
        }
        
        // Fallback: if still no tech from topics or languages API, use the primary language from repo.language
        // But only if we didn't get languages from the API (to avoid duplicates)
        if (tech.length === 0 && repo.language) {
          tech.push(repo.language);
        } else if (tech.length > 0 && !repo.languages && repo.language) {
          // If we have tech from topics but languages API failed, still add primary language if not already present
          const formatted = repo.language
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          if (!tech.includes(formatted)) {
            tech.push(formatted);
          }
        }
        
        // Determine demo URL
        let demoUrl = '#';
        if (repo.homepage && repo.homepage !== '') {
          demoUrl = repo.homepage;
        } else if (repo.name === 'MyLink') {
          demoUrl = 'https://developer.epildevconnect.uk/';
        } else if (repo.name.includes('8bp') || repo.name.includes('rewards')) {
          demoUrl = 'https://8ballpool.website/8bp-rewards/home';
        }
        
        // Description handling with OpenAI integration
        let description = repo.description;
        const githubDescription = repo.description;
        
        // Check if we need to generate a description
        const needsGeneration = 
          !githubDescription || 
          githubDescription.trim() === '' || 
          isPlaceholderDescription(githubDescription);
        
        // Check database cache first
        const cachedDesc = await getProjectDescription(repo.name);
        const shouldRegenerate = cachedDesc?.regenerate_flag === true;
        
        if (needsGeneration || shouldRegenerate) {
          // Try to use cached OpenAI description first (if not flagged for regeneration)
          if (cachedDesc && cachedDesc.is_auto_generated && !shouldRegenerate) {
            description = cachedDesc.description;
            console.log(`[BACKEND] Using cached OpenAI description for ${repo.name}`);
          } else {
            // Generate new description using OpenAI
            const generatedDesc = await generateProjectDescription({
              name: repo.name,
              languages: repo.languages || {},
              topics: repo.topics || [],
              readmeExcerpt: repo.readmeExcerpt,
              description: githubDescription
            });
            
            if (generatedDesc) {
              // Save to database
              await saveProjectDescription(repo.name, generatedDesc, true, 'openai');
              description = generatedDesc;
              console.log(`[BACKEND] Generated and cached OpenAI description for ${repo.name}`);
            } else {
              // OpenAI generation failed, try cached description even if old
              if (cachedDesc) {
                description = cachedDesc.description;
                console.log(`[BACKEND] OpenAI generation failed, using cached description for ${repo.name}`);
              } else {
                // Fallback to hardcoded descriptions
                if (repo.name === 'myhub') {
                  description = 'Real-time personal dashboard with live API integrations featuring Discord presence, Last.fm music tracking, and WakaTime coding stats';
                } else if (repo.name === '8bp-rewards-5.2-Public') {
                  description = 'Comprehensive automated rewards system for 8 Ball Pool with Discord bot integration, browser automation, PostgreSQL database, and real-time claim tracking';
                } else if (repo.name === '8bp-rewards-5.0-Public' || repo.name === '8bp-rewards-5.0') {
                  description = 'Comprehensive automated rewards system for 8 Ball Pool with Discord bot integration, browser automation, PostgreSQL database, and real-time claim tracking';
                } else if (repo.name.includes('8bp') || repo.name.includes('rewards')) {
                  description = 'Automated rewards system for 8 Ball Pool with Discord integration, browser automation, and comprehensive user management';
                } else if (repo.name === 'BTD6-Auto-Assign') {
                  description = 'Automated tower assignment system for Bloons TD 6 with intelligent placement algorithms and strategic optimisation';
                } else {
                  // Last resort: formatted name
                  description = repo.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                }
                console.log(`[BACKEND] Using fallback description for ${repo.name}`);
              }
            }
          }
        } else {
          // GitHub description is valid, use it and cache it
          description = githubDescription;
          // Cache the GitHub description (if not already cached or if different)
          if (!cachedDesc || cachedDesc.description !== githubDescription) {
            await saveProjectDescription(repo.name, githubDescription, false, 'github');
          }
        }
        
        // Format title - special handling for specific repos
        let title = repo.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        if (repo.name === '8bp-rewards-5.2-Public') {
          title = '8BP Rewards 5.2';
        } else if (repo.name === '8bp-rewards-5.0-Public') {
          title = '8BP Rewards 5.0';
        } else if (repo.name === '8bp-rewards-4.3.2') {
          title = '8BP Rewards V4.3.2';
        } else if (repo.name === 'BTD6-Auto-Assign') {
          title = 'BTD6 Auto Assign';
        } else if (repo.name === 'Discord-Giveaway-BOT') {
          title = 'Discord Giveaway BOT';
        }
        
        let image: string | undefined;
        if (repo.name.includes('8bp') || repo.name.includes('rewards')) {
          image = '/8bp-logo.png';
        } else if (repo.name === 'BTD6-Auto-Assign') {
          image = '/btd6-logo.png?v=2';
        }

        return {
          id: repo.id,
          title: title,
          description: description,
          tech: tech.length > 0 ? tech : ['GitHub'],
          github: repo.html_url,
          demo: demoUrl,
          featured: repo.topics && repo.topics.includes('featured'),
          updatedAt: repo.updated_at,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
        };
      })
    );
    
    // Sort projects
    projects.sort((a: any, b: any) => {
        // Sort by featured first, then by updated date
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    
    console.log(`[BACKEND] GitHub API success - found ${projects.length} projects`);
    return { projects };
}

// Serve repos with stale-while-revalidate: cached data is returned
// instantly (even if expired) and an expired cache triggers a single
// background refresh, so visitors never wait on the GitHub API.
let reposRefreshInFlight = false;
const handleGitHubRepos = async (req: express.Request, res: express.Response) => {
  const cacheKey = 'github_repos';
  const entry = githubCache.get(cacheKey);

  if (entry) {
    res.json(entry.data);
    const isStale = Date.now() - entry.timestamp > entry.ttl;
    if (isStale && !reposRefreshInFlight) {
      reposRefreshInFlight = true;
      buildGitHubReposData()
        .then((result) => setCached(cacheKey, result))
        .catch((err: any) => console.error('[BACKEND] Background repos refresh failed:', err?.message))
        .finally(() => { reposRefreshInFlight = false; });
    }
    return;
  }

  try {
    const result = await buildGitHubReposData();
    setCached(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    console.error('GitHub API error:', error?.response?.status, error?.message);
    if (error?.response?.status === 403 || error?.response?.status === 429) {
      const githubToken = process.env.GITHUB_TOKEN;
      const rateLimitRemaining = error?.response?.headers['x-ratelimit-remaining'];
      const rateLimitReset = error?.response?.headers['x-ratelimit-reset'];
      const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : 'unknown';
      
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `GitHub API rate limit exceeded. ${githubToken ? 'Consider adding GITHUB_TOKEN to .env for higher limits.' : 'Add GITHUB_TOKEN to .env for 5000 requests/hour instead of 60.'} Rate limit resets at: ${resetTime}`,
        projects: [],
        rateLimitRemaining,
        rateLimitReset: resetTime
      });
    }
    // Network/timeout errors
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT' || error?.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        error: 'Service temporarily unavailable',
        message: 'GitHub API is currently unreachable.',
        projects: []
      });
    }
    res.status(500).json({ error: 'Failed to fetch GitHub repositories', projects: [] });
  }
};

apiRouter.get('/github/repos', handleGitHubRepos);
app.get('/api/github/repos', handleGitHubRepos);

// Cache clear endpoint - forces fresh fetch from GitHub
const handleClearCache = async (req: express.Request, res: express.Response) => {
  const pattern = req.query.pattern as string | undefined;
  console.log(`[BACKEND] /api/cache/clear hit - pattern: ${pattern || 'all'}`);
  
  try {
    const clearedCount = clearCache(pattern);
    res.json({
      success: true,
      message: `Cleared ${clearedCount} cache entries`,
      pattern: pattern || 'all'
    });
  } catch (error: any) {
    console.error('[BACKEND] Cache clear error:', error?.message);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
};

apiRouter.post('/cache/clear', handleClearCache);
app.post('/api/cache/clear', handleClearCache);

// GitHub code snippets: builds the snippet list from the GitHub API.
async function buildGitHubSnippetsData(): Promise<any> {
    const configuredUsername = process.env.GITHUB_USERNAME;
    const githubUserCandidates = Array.from(
      new Set(
        [
          configuredUsername,
          process.env.GITHUB_USERNAME_FALLBACK,
          'gitEpildev',
          'epildev'
        ].filter(Boolean)
      )
    ) as string[];
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      console.warn('[BACKEND] ⚠️ GITHUB_TOKEN not set! Rate limits will be lower');
    }
    
    const headers: any = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Epildevconnect-Site/2.0'
    };
    
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }
    
    const tryFetchSnippet = async (owners: string[], repo: string, path: string) => {
      // Keep this tight to ensure the endpoint stays responsive.
      const refs = ['main', 'master'];
      const candidateOwners = owners.slice(0, 1);

      for (const owner of candidateOwners) {
        for (const ref of refs) {
          try {
            const response = await axios.get(
              `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
              { headers, timeout: 2500 }
            );

            if (response?.data?.content) {
              return {
                owner,
                ref,
                content: Buffer.from(response.data.content, 'base64').toString('utf-8')
              };
            }
          } catch (err: any) {
            // Continue trying other owner/ref combinations.
            if (err?.response?.status !== 404) {
              console.warn(
                `[BACKEND] Snippet fetch issue for ${owner}/${repo}/${path}@${ref}:`,
                err?.response?.status || err?.message
              );
            }
          }
        }
      }

      throw new Error(`Snippet not found for ${repo}/${path} across owners/refs`);
    };

    const inferLanguageFromPath = (path: string): string => {
      if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript';
      if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript';
      if (path.endsWith('.py')) return 'python';
      if (path.endsWith('.go')) return 'go';
      if (path.endsWith('.java')) return 'java';
      if (path.endsWith('.json')) return 'json';
      if (path.endsWith('.md')) return 'markdown';
      if (path.endsWith('.yml') || path.endsWith('.yaml')) return 'yaml';
      return 'text';
    };

    const toTitle = (repoName: string, path: string): string => {
      const repoTitle = repoName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      const fileName = path.split('/').pop() || path;
      return `${repoTitle} - ${fileName}`;
    };

    // Get recent repos dynamically so Code Viewer stays fresh.
    let reposOwner = githubUserCandidates[0];
    let recentRepos: any[] = [];
    for (const owner of githubUserCandidates) {
      try {
        const reposResponse = await axios.get(
          `https://api.github.com/users/${owner}/repos?sort=updated&per_page=20&type=public`,
          { headers, timeout: 4000 }
        );
        recentRepos = reposResponse.data || [];
        reposOwner = owner;
        if (recentRepos.length > 0) break;
      } catch (err: any) {
        console.warn(`[BACKEND] Failed repo list fetch for ${owner}:`, err?.response?.status || err?.message);
      }
    }

    const filteredRepos = recentRepos
      .filter((repo: any) => !repo.archived && !repo.fork)
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    // Prefer these repos at the top if they exist.
    const pinnedRepos = ['myhub', '8bp-rewards-5.2-Public', '8bp-rewards-5.0-Public', 'BTD6-Auto-Assign'];
    const orderedRepoNames = Array.from(
      new Set([
        ...pinnedRepos.filter((name) => filteredRepos.some((r: any) => r.name === name)),
        ...filteredRepos.map((r: any) => r.name),
      ])
    ).slice(0, 8);
    const repoOwnerByName = new Map<string, string>(
      filteredRepos.map((repo: any) => [repo.name, repo.owner?.login || reposOwner])
    );

    const pathCandidates = [
      'server/index.ts',
      'src/main.tsx',
      'src/App.tsx',
      'backend/src/server.ts',
      'src/components/messages/ChatView.tsx',
      'src/components/ParticleBackground.tsx',
      'src/components/ActivityFeed.tsx',
      'backend/src/services/DiscordNotificationService.ts',
      'README.md',
    ];

    const snippets: any[] = [];

    for (const repoName of orderedRepoNames) {
      if (snippets.length >= 12) break;

      let selected: any = null;
      for (const path of pathCandidates) {
        if (snippets.length >= 12) break;

        const snippetCacheKey = `github_snippet_${repoName}_${path}`;
        const cachedSnippet = getCached(snippetCacheKey);
        if (cachedSnippet) {
          selected = cachedSnippet;
          break;
        }

        try {
          const repoOwner = repoOwnerByName.get(repoName) || reposOwner;
          const fetched = await tryFetchSnippet([repoOwner], repoName, path);
          const lines = fetched.content.split('\n');
          const limitedContent = lines.slice(0, 500).join('\n');

          const snippetData = {
            id: `${repoName}:${path}`,
            title: toTitle(repoName, path),
            language: inferLanguageFromPath(path),
            code: limitedContent,
            repo: repoName,
            path,
            fullUrl: `https://github.com/${fetched.owner}/${repoName}/blob/${fetched.ref}/${path}`,
          };

          setCached(snippetCacheKey, snippetData, 10 * 60 * 1000);
          selected = snippetData;
          break;
        } catch {
          // Try the next candidate path.
        }
      }

      if (selected) {
        snippets.push(selected);
      }
    }

    // Keep UI populated if GitHub repo structure changes unexpectedly.
    if (snippets.length === 0) {
      snippets.push({
        id: 'fallback-no-snippets',
        title: 'No snippets found',
        language: 'markdown',
        code: '# No snippets available\n\nUnable to fetch code snippets from recent repositories right now.',
        repo: orderedRepoNames[0] || 'unknown',
        path: 'README.md',
        fullUrl: reposOwner ? `https://github.com/${reposOwner}` : undefined,
      });
    }
    
    console.log(`[BACKEND] GitHub code snippets success - found ${snippets.length} snippets`);
    return { snippets };
}

// Serve snippets with stale-while-revalidate, same pattern as repos.
let snippetsRefreshInFlight = false;
const handleGitHubCodeSnippets = async (req: express.Request, res: express.Response) => {
  const cacheKey = 'github_code_snippets';
  const entry = githubCache.get(cacheKey);

  if (entry) {
    res.json(entry.data);
    const isStale = Date.now() - entry.timestamp > entry.ttl;
    if (isStale && !snippetsRefreshInFlight) {
      snippetsRefreshInFlight = true;
      buildGitHubSnippetsData()
        .then((result) => setCached(cacheKey, result, 10 * 60 * 1000))
        .catch((err: any) => console.error('[BACKEND] Background snippets refresh failed:', err?.message))
        .finally(() => { snippetsRefreshInFlight = false; });
    }
    return;
  }

  try {
    const result = await buildGitHubSnippetsData();
    setCached(cacheKey, result, 10 * 60 * 1000);
    res.json(result);
  } catch (error: any) {
    console.error('GitHub code snippets error:', error?.response?.status, error?.message);
    if (error?.response?.status === 403 || error?.response?.status === 429) {
      const githubToken = process.env.GITHUB_TOKEN;
      const rateLimitRemaining = error?.response?.headers['x-ratelimit-remaining'];
      const rateLimitReset = error?.response?.headers['x-ratelimit-reset'];
      const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset) * 1000).toISOString() : 'unknown';
      
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `GitHub API rate limit exceeded. ${githubToken ? 'Consider adding GITHUB_TOKEN to .env for higher limits.' : 'Add GITHUB_TOKEN to .env for 5000 requests/hour instead of 60.'} Rate limit resets at: ${resetTime}`,
        snippets: [],
        rateLimitRemaining,
        rateLimitReset: resetTime
      });
    }
    res.status(500).json({ error: 'Failed to fetch GitHub code snippets', snippets: [] });
  }
};

apiRouter.get('/github/code-snippets', handleGitHubCodeSnippets);
app.get('/api/github/code-snippets', handleGitHubCodeSnippets);

// System Specs endpoint - moved to be registered with other explicit routes
// Handler definition:
async function handleSystemSpecs(req: express.Request, res: express.Response) {
  try {
    // Server specs (auto-detected)
    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown';
    const cpuCores = cpus.length;
    const totalMem = os.totalmem();

    // RAM usage: prefer /proc/meminfo MemAvailable (os.freemem() ignores page
    // cache on Linux and overstates usage)
    let usedMem = totalMem - os.freemem();
    try {
      const meminfo = execSync('cat /proc/meminfo', { encoding: 'utf8' });
      const totalMatch = meminfo.match(/MemTotal:\s+(\d+) kB/);
      const availMatch = meminfo.match(/MemAvailable:\s+(\d+) kB/);
      if (totalMatch && availMatch) {
        usedMem = (parseInt(totalMatch[1]) - parseInt(availMatch[1])) * 1024;
      }
    } catch {
      // Not Linux or /proc unavailable; fall back to os.freemem()
    }
    // Hardware has 128 GB fitted; the kernel reports slightly less as usable
    const ramTotalGB = 128;
    const ramUsedGB = Math.round((usedMem / 1024 ** 3) * 10) / 10;

    // Disk usage from df (root filesystem)
    let storage = process.env.VPS_STORAGE || '960 GB NVMe';
    let storageUsedGB = 0;
    let storageTotalGB = 960;
    try {
      const df = execSync('df -k /', { encoding: 'utf8' }).trim().split('\n').pop() || '';
      const parts = df.split(/\s+/);
      const totalKB = parseInt(parts[1]);
      const usedKB = parseInt(parts[2]);
      if (totalKB > 0) {
        storageUsedGB = Math.round(usedKB / 1024 / 1024);
        storageTotalGB = Math.round(totalKB / 1024 / 1024 / 10) * 10; // drive is sold as 960 GB
        storage = `${storageUsedGB}GB / ${storageTotalGB}GB NVMe`;
      }
    } catch {
      // df unavailable; keep the static description
    }

    // Calculate CPU usage
    // Get initial CPU times
    const initialCpus = os.cpus();
    const initialTotal = initialCpus.reduce((acc, cpu) => {
      return acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    }, 0);
    const initialIdle = initialCpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    
    // Wait 100ms and measure again to calculate usage
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalCpus = os.cpus();
    const finalTotal = finalCpus.reduce((acc, cpu) => {
      return acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
    }, 0);
    const finalIdle = finalCpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    
    // Calculate CPU usage percentage
    const totalDiff = finalTotal - initialTotal;
    const idleDiff = finalIdle - initialIdle;
    const cpuUsed = totalDiff - idleDiff;
    const cpuUsagePercent = totalDiff > 0 ? ((cpuUsed / totalDiff) * 100).toFixed(1) : '0.0';

    const vpsSpecs = {
      cpu: `${cpuUsagePercent}% (${cpuCores} cores)`,
      cpuCores: cpuCores,
      cpuModel: cpuModel,
      cpuUsagePercent: cpuUsagePercent,
      ram: `${ramUsedGB}GB / ${ramTotalGB}GB`,
      ramUsedGB: ramUsedGB,
      ramTotalGB: ramTotalGB,
      ramUsedPercent: ((ramUsedGB / ramTotalGB) * 100).toFixed(1),
      storage: storage,
      storageUsedGB: storageUsedGB,
      storageTotalGB: storageTotalGB,
      os: os.platform(),
      osRelease: os.release(),
      hostname: os.hostname(),
      nodeVersion: process.version,
    };
    
    // Mac Specs (from environment variables with defaults)
    const macSpecs = {
      model: process.env.MAC_MODEL || 'MacBook Pro 16-inch, 2023',
      cpu: process.env.MAC_CPU || 'Apple M2 Max',
      ram: process.env.MAC_RAM || '96 GB',
      storage: process.env.MAC_STORAGE || 'Macintosh HD',
      os: process.env.MAC_OS || 'Tahoe 26.2',
    };
    
    res.json({
      mac: macSpecs,
      vps: vpsSpecs,
    });
  } catch (error: any) {
    console.error('[SystemSpecs] Error:', error?.message, error?.stack);
    res.status(500).json({ error: 'Failed to fetch system specs' });
  }
}

// CRITICAL: Register routes IMMEDIATELY after handler definition (EXACT same pattern as wakatime/lastfm)
apiRouter.get('/system/specs', handleSystemSpecs);
// Register EXACTLY like wakatime - inline handler to ensure it works
app.get('/api/system/specs', (req, res, next) => {
  console.log('[SystemSpecs Route] ✅ EXPRESS MATCHED!');
  return handleSystemSpecs(req, res).catch(next);
});

// CRITICAL: Register explicit /myhub/api/* routes BEFORE app.all to ensure they match first
app.get('/api/auth/user', authUserHandler);
app.post('/api/auth/logout', logoutHandler);
// Note: handleContactEmail route registered after function definition below

// CRITICAL: Mount API router for /api/* paths
app.use('/api', apiRouter);


function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  if (hours > 0) return `${hours} hrs ${mins} mins`;
  if (mins > 0) return `${mins} mins`;
  return `${secs} secs`;
}

// Contact Form Routes
app.post('/api/contact/discord', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { message } = req.body;
    const user: any = req.user;
    
    // Try to send DM via Discord bot first
    if (discordBot && discordBot.user) {
      try {
        const adminUserId = process.env.ADMIN_DISCORD_ID;
        if (adminUserId) {
          const adminUser = await discordBot.users.fetch(adminUserId);
          await adminUser.send(`**Message from ${user.profile.username}:**\n${message}`);
          return res.json({ success: true, method: 'discord' });
        }
      } catch (dmError: any) {
        console.error('Failed to send Discord DM:', dmError.message);
        // Fall through to email notification
      }
    }
    
    // Fallback to email notification
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
        await transporter.sendMail({
          from: fromEmail, // Plain email address
          to: process.env.SMTP_USER,
          subject: `Epildevconnect Contact from ${user.profile.username}`,
      text: `Message from Discord user ${user.profile.username}#${user.profile.discriminator}:\n\n${message}`,
      html: `
        <h3>Message from Discord user ${user.profile.username}#${user.profile.discriminator}</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Discord message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

const handleContactEmail = async (req: express.Request, res: express.Response) => {
  try {
    console.log('[ContactEmail] Request received, path:', req.path, 'originalUrl:', req.originalUrl);
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      console.log('[ContactEmail] Missing required fields');
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('[ContactEmail] SMTP not configured - missing environment variables');
      return res.status(500).json({ 
        error: 'Email service not configured',
        details: 'SMTP settings are missing. Please contact the administrator.'
      });
    }

    // Send email to site owner (Blake) - This is critical, must succeed
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    console.log(`[ContactEmail] Notification - FROM: ${fromEmail}, Auth User: ${smtpAuthUser}, TO: ${process.env.SMTP_USER}`);
    console.log(`[ContactEmail] SMTP Config - Host: ${process.env.SMTP_HOST}, Port: ${process.env.SMTP_PORT || '587'}`);
    
    await transporter.sendMail({
      from: fromEmail, // Plain email address - no display name
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `Epildevconnect Contact: ${subject} (from ${name})`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    console.log('[ContactEmail] Notification email sent successfully');

    // Send confirmation email to sender - This is non-critical, don't fail the request if it fails
    console.log(`[ContactEmail] Confirmation - FROM: ${fromEmail}, Auth User: ${smtpAuthUser}, TO: ${email}, REPLY-TO: ${process.env.SMTP_USER}`);
    const mailOptions: any = {
      from: fromEmail, // Plain email address - no display name
      to: email,
      replyTo: process.env.SMTP_USER, // When user replies, it goes to connectwithme@epildevconnect.uk
      subject: `Re: ${subject}`,
      text: `Hi ${name},\n\nThank you for reaching out! I've received your message regarding "${subject}" and will get back to you as soon as possible.\n\nYour message:\n${message}\n\nBest regards,\nBlake (@epildev)\nEpildevconnect Ltd`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f; color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border-radius: 16px; border: 1px solid rgba(0, 217, 255, 0.1); backdrop-filter: blur(10px);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(0, 217, 255, 0.1);">
                        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #00d9ff; text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);">
                          Epildevconnect Ltd
                        </h1>
                        <p style="margin: 10px 0 0; font-size: 14px; color: #8899aa; font-family: 'Courier New', monospace;">
                          developer.epildevconnect.uk
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff;">
                          Hi ${name},
                        </h2>
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #cccccc;">
                          Thank you for reaching out! I've received your message regarding <strong style="color: #00d9ff;">"${subject}"</strong> and will get back to you as soon as possible.
                        </p>
                        
                        <!-- Message Quote -->
                        <div style="margin: 30px 0; padding: 20px; background: rgba(0, 217, 255, 0.05); border-left: 4px solid #00d9ff; border-radius: 8px;">
                          <p style="margin: 0 0 10px; font-size: 12px; color: #8899aa; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;">
                            Subject: ${subject}
                          </p>
                          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e0e0e0;">
                            ${message.replace(/\n/g, '<br>')}
                          </p>
                        </div>
                        
                        <p style="margin: 0 0 10px; font-size: 16px; line-height: 1.6; color: #cccccc;">
                          I typically respond within 24-48 hours. If you need urgent assistance, you can also reach me on Discord.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; border-top: 1px solid rgba(0, 217, 255, 0.1); background: rgba(0, 0, 0, 0.2); border-radius: 0 0 16px 16px;">
                        <p style="margin: 0 0 15px; font-size: 14px; color: #ffffff;">
                          <strong>Blake (@epildev)</strong>
                        </p>
                        <p style="margin: 0 0 5px; font-size: 13px; color: #8899aa;">
                          DevOps Engineer & Senior App Developer | AI Modelling & App Development | Music Producer
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #8899aa;">
                          Hythe, Southampton, England
                        </p>
                        <div style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                          <p style="margin: 0; font-size: 12px; color: #666; font-family: 'Courier New', monospace;">
                            © 2026 Epildevconnect Ltd (Company No. 17247566). All rights reserved.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };
    
    // Send confirmation email, but don't fail the request if it fails
    transporter.sendMail(mailOptions).catch((confirmationError) => {
      console.error('[ContactEmail] Confirmation email failed (non-critical):', confirmationError?.message);
    });

    console.log('[ContactEmail] Success - returning response');
    res.json({ success: true });
  } catch (error: any) {
    console.error('[ContactEmail] Error:', error?.message);
    console.error('[ContactEmail] Error details:', {
      message: error?.message,
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode,
      responseMessage: error?.responseMessage,
      stack: error?.stack,
    });
    res.status(500).json({ 
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
};

// Register email route AFTER function definition
app.post('/api/contact/email', handleContactEmail);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve public assets (logos, images)
app.use(express.static('public'));
// Serve static assets (JS, CSS, images) - must come AFTER all API routes
app.use(express.static('dist', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// Handle client-side routing - send index.html for all non-API/auth paths
app.get('*', (req, res, next) => {
  const p = req.path;
  if (p.startsWith('/api') || p.startsWith('/auth') || p.startsWith('/health')) {
    return next();
  }
  res.sendFile('index.html', { root: 'dist' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  // Don't expose error details in production
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
});

async function initializeDiscordBot() {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  
  if (!botToken) {
    console.warn('⚠️  DISCORD_BOT_TOKEN not set - Discord bot will not be online');
    return;
  }

  try {
    discordBot = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
      ],
    });

    discordBot.once('clientReady', () => {
      console.log(`🤖 Discord bot is online! Logged in as ${discordBot?.user?.tag}`);
    });
    
    // Also listen to 'ready' for backwards compatibility
    discordBot.once('ready', () => {
      console.log(`🤖 Discord bot is online! Logged in as ${discordBot?.user?.tag}`);
    });

    discordBot.on('error', (error) => {
      console.error('❌ Discord bot error:', error);
    });

    await discordBot.login(botToken);
    console.log('🔌 Discord bot connecting...');
  } catch (error: any) {
    console.error('❌ Failed to initialize Discord bot:', error.message);
    discordBot = null;
  }
}

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    // Initialize Discord bot
    await initializeDiscordBot();
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`💬 Discord DM system initialized`);
    });

    // Warm the GitHub caches so the first visitor gets instant responses
    buildGitHubReposData()
      .then((result) => setCached('github_repos', result))
      .catch((err: any) => console.error('[BACKEND] Repos cache warm-up failed:', err?.message));
    buildGitHubSnippetsData()
      .then((result) => setCached('github_code_snippets', result, 10 * 60 * 1000))
      .catch((err: any) => console.error('[BACKEND] Snippets cache warm-up failed:', err?.message));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


