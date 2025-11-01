"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_discord_1 = require("passport-discord");
const nodemailer_1 = __importDefault(require("nodemailer"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const os_1 = __importDefault(require("os"));
const db_js_1 = require("./db.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.BACKEND_PORT || 1600;
// Trust proxy - Required for Cloudflare Tunnel
app.set('trust proxy', true);
// Middleware
app.use((0, cors_1.default)({
    origin: [
        `http://localhost:${process.env.FRONTEND_PORT || 1500}`,
        'https://developer.epildevconnect.uk'
    ],
    credentials: true,
}));
app.use(express_1.default.json());
// Rate limiting (configured for Cloudflare Tunnel)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per window (increased for dashboard polling)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false }, // Disable validation since we're behind Cloudflare
});
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 login attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
});
const messageLimiter = (0, express_rate_limit_1.default)({
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
const apiRouter = express_1.default.Router();
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'myhub-secret-key',
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
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// TEST: Route at the very top to verify routing works
app.get('/test-top-route', (req, res) => {
    console.log('[BACKEND] TOP TEST ROUTE MATCHED!');
    res.json({ success: true, message: 'Top route working!' });
});
// Discord OAuth Configuration
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    const callbackURL = process.env.DISCORD_REDIRECT_URI || 'http://localhost:1500/myhub/auth/callback';
    console.log('[Auth] Discord OAuth configured with callbackURL:', callbackURL);
    passport_1.default.use(new passport_discord_1.Strategy({
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: callbackURL,
        scope: ['identify', 'email'],
    }, (accessToken, refreshToken, profile, done) => {
        return done(null, { profile, accessToken });
    }));
    passport_1.default.serializeUser((user, done) => {
        done(null, user);
    });
    passport_1.default.deserializeUser((obj, done) => {
        done(null, obj);
    });
}
// Nodemailer Configuration
// Authenticate as no-reply@ if SMTP_FROM_EMAIL is set (same password), otherwise use SMTP_USER
const smtpAuthUser = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: smtpAuthUser, // Authenticate as no-reply@ since password is the same
        pass: process.env.SMTP_PASS,
    },
});
// Auth Routes (supporting both /auth and /myhub/auth paths)
const authCallbackHandler = async (req, res) => {
    try {
        const user = req.user?.profile;
        if (user) {
            const userId = user.id;
            const userName = user.username || user.global_name || 'Unknown';
            const userAvatar = user.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` : null;
            // Get user's IP address
            const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] ||
                req.socket.remoteAddress ||
                'Unknown';
            // Log user login
            await (0, db_js_1.logUserLogin)(userId, userName, userAvatar, ipAddress);
            // Check if user is blocked
            const blocked = await (0, db_js_1.isUserBlocked)(userId);
            if (blocked) {
                req.logout(() => {
                    res.redirect('https://developer.epildevconnect.uk/myhub/?error=blocked');
                });
                return;
            }
        }
        // Check if already redirected to prevent loops
        if (req.session?.authRedirected) {
            console.log('[Auth] Already redirected, preventing loop');
            return res.redirect('https://developer.epildevconnect.uk/myhub/messages');
        }
        // Mark as redirected to prevent loops
        req.session.authRedirected = true;
        // Save session synchronously before redirect
        console.log('[Auth] Session ID:', req.sessionID);
        console.log('[Auth] User authenticated:', req.isAuthenticated());
        console.log('[Auth] User:', req.user?.profile?.username);
        // Manually save session and wait for it to complete
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('[Auth] Session save error:', err);
                    reject(err);
                }
                else {
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
        res.redirect('https://developer.epildevconnect.uk/myhub/messages');
    }
    catch (error) {
        console.error('Error in auth callback:', error);
        // Clear the redirect flag on error
        if (req.session) {
            req.session.authRedirected = false;
        }
        res.redirect('https://developer.epildevconnect.uk/myhub/messages');
    }
};
// Register routes for both /auth and /myhub/auth paths
app.get('/auth/discord', (req, res, next) => {
    console.log('[Auth] Initiating Discord OAuth flow');
    passport_1.default.authenticate('discord')(req, res, next);
});
app.get('/myhub/auth/discord', (req, res, next) => {
    console.log('[Auth] Initiating Discord OAuth flow (myhub path)');
    passport_1.default.authenticate('discord')(req, res, next);
});
app.get('/auth/callback', (req, res, next) => {
    // Check if already processed to prevent loops
    if (req.session?.authRedirected) {
        console.log('[Auth] Callback already processed, redirecting to messages');
        return res.redirect('https://developer.epildevconnect.uk/myhub/messages');
    }
    next();
}, passport_1.default.authenticate('discord', { failureRedirect: 'https://developer.epildevconnect.uk/' }), (req, res, next) => {
    console.log('[Auth] Discord callback received, user:', req.user?.profile?.username);
    console.log('[Auth] Session ID:', req.sessionID);
    console.log('[Auth] Is Authenticated:', req.isAuthenticated());
    authCallbackHandler(req, res).catch((err) => {
        console.error('[Auth] Callback handler error:', err);
        res.redirect('https://developer.epildevconnect.uk/myhub/messages');
    });
});
app.get('/myhub/auth/callback', (req, res, next) => {
    // Check if already processed to prevent loops
    if (req.session?.authRedirected) {
        console.log('[Auth] Callback already processed, redirecting to messages');
        return res.redirect('https://developer.epildevconnect.uk/myhub/messages');
    }
    next();
}, passport_1.default.authenticate('discord', { failureRedirect: 'https://developer.epildevconnect.uk/' }), (req, res, next) => {
    console.log('[Auth] Discord callback received (myhub path), user:', req.user?.profile?.username);
    console.log('[Auth] Session ID:', req.sessionID);
    console.log('[Auth] Is Authenticated:', req.isAuthenticated());
    authCallbackHandler(req, res).catch((err) => {
        console.error('[Auth] Callback handler error:', err);
        res.redirect('https://developer.epildevconnect.uk/myhub/messages');
    });
});
const authUserHandler = (req, res) => {
    console.log('[Auth] /auth/user request - Session ID:', req.sessionID);
    console.log('[Auth] Is Authenticated:', req.isAuthenticated());
    console.log('[Auth] User:', req.user ? req.user?.profile?.username : 'null');
    console.log('[Auth] Cookie header:', req.headers.cookie ? 'Present' : 'Missing');
    // Always try to save/touch session if it exists
    if (req.session && req.sessionID) {
        req.session.touch(); // Refresh session expiry
        req.session.save(); // Save session changes
    }
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    }
    else {
        res.json({ user: null });
    }
};
const logoutHandler = (req, res) => {
    req.logout(() => {
        res.json({ success: true });
    });
};
app.get('/auth/user', authUserHandler);
app.get('/myhub/auth/user', authUserHandler);
// Also register on /myhub/api/* path since frontend uses /myhub/api baseURL
app.get('/myhub/api/auth/user', authUserHandler);
app.post('/auth/logout', logoutHandler);
app.post('/myhub/auth/logout', logoutHandler);
app.post('/myhub/api/auth/logout', logoutHandler);
// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    const userId = req.user?.profile?.id;
    const adminId = process.env.ADMIN_DISCORD_ID;
    if (userId === adminId) {
        return next();
    }
    res.status(403).json({ error: 'Forbidden: Admin access required' });
};
// Middleware to check if user is authenticated and not blocked
const isAuthenticated = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    // Check if user is blocked
    const userId = req.user?.profile?.id;
    if (userId) {
        const blocked = await (0, db_js_1.isUserBlocked)(userId);
        if (blocked) {
            req.logout(() => { });
            return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
        }
    }
    next();
};
// ========================================
// ADMIN USER MANAGEMENT API ENDPOINTS
// ========================================
// Get all users (admin only)
const handleAdminUsers = async (req, res) => {
    try {
        const result = await db_js_1.pool.query('SELECT user_id, user_name, user_avatar, ip_address, is_blocked, block_reason, last_login, created_at FROM users ORDER BY last_login DESC');
        res.json({ users: result.rows });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
// Register admin users route
app.get('/api/admin/users', isAdmin, handleAdminUsers);
app.get('/myhub/api/admin/users', isAdmin, handleAdminUsers);
// Block a user (admin only)
const handleBlockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        await db_js_1.pool.query('UPDATE users SET is_blocked = TRUE, block_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2', [reason || 'No reason provided', userId]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ error: 'Failed to block user' });
    }
};
app.post('/api/admin/users/:userId/block', isAdmin, handleBlockUser);
app.post('/myhub/api/admin/users/:userId/block', isAdmin, handleBlockUser);
// Unblock a user (admin only)
const handleUnblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        await db_js_1.pool.query('UPDATE users SET is_blocked = FALSE, block_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1', [userId]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).json({ error: 'Failed to unblock user' });
    }
};
app.post('/api/admin/users/:userId/unblock', isAdmin, handleUnblockUser);
app.post('/myhub/api/admin/users/:userId/unblock', isAdmin, handleUnblockUser);
// Delete a user and all their data (admin only)
const handleDeleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        // Delete user's messages first (cascade should handle this, but being explicit)
        await db_js_1.pool.query('DELETE FROM messages WHERE sender_id = $1', [userId]);
        // Delete user's conversations
        await db_js_1.pool.query('DELETE FROM conversations WHERE user_id = $1', [userId]);
        // Delete user
        await db_js_1.pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
app.delete('/api/admin/users/:userId', isAdmin, handleDeleteUser);
app.delete('/myhub/api/admin/users/:userId', isAdmin, handleDeleteUser);
// ========================================
// CONVERSATION & MESSAGE API ENDPOINTS
// ========================================
// Get all conversations handler
const handleGetConversations = async (req, res) => {
    try {
        const userId = req.user?.profile?.id;
        const adminId = process.env.ADMIN_DISCORD_ID;
        const isUserAdmin = userId === adminId;
        let query = 'SELECT * FROM conversations';
        let params = [];
        if (!isUserAdmin) {
            // Regular users only see their own conversation
            query += ' WHERE user_id = $1';
            params = [userId];
        }
        query += ' ORDER BY last_message_at DESC';
        const result = await db_js_1.pool.query(query, params);
        res.json({ conversations: result.rows, isAdmin: isUserAdmin });
    }
    catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};
app.get('/api/conversations', isAuthenticated, handleGetConversations);
app.get('/myhub/api/conversations', isAuthenticated, handleGetConversations);
// Get a specific conversation handler
const handleGetConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.profile?.id;
        const adminId = process.env.ADMIN_DISCORD_ID;
        const isUserAdmin = userId === adminId;
        const result = await db_js_1.pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        const conversation = result.rows[0];
        // Check permissions: admin can see all, users can only see their own
        if (!isUserAdmin && conversation.user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        res.json({ conversation });
    }
    catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
};
app.get('/api/conversations/:id', isAuthenticated, handleGetConversation);
app.get('/myhub/api/conversations/:id', isAuthenticated, handleGetConversation);
// Get messages for a conversation handler
const handleGetMessages = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.profile?.id;
        const adminId = process.env.ADMIN_DISCORD_ID;
        const isUserAdmin = userId === adminId;
        // First check if user has permission to view this conversation
        const convResult = await db_js_1.pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
        if (convResult.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        const conversation = convResult.rows[0];
        if (!isUserAdmin && conversation.user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        // Fetch messages
        const messagesResult = await db_js_1.pool.query('SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC', [id]);
        res.json({ messages: messagesResult.rows });
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
app.get('/api/conversations/:id/messages', isAuthenticated, handleGetMessages);
app.get('/myhub/api/conversations/:id/messages', isAuthenticated, handleGetMessages);
// Send a message handler
const handleSendMessage = async (req, res) => {
    try {
        console.log('[SendMessage] Request received, path:', req.path);
        console.log('[SendMessage] User authenticated:', req.isAuthenticated());
        console.log('[SendMessage] User:', req.user?.profile?.username);
        const { id } = req.params;
        const { content } = req.body;
        console.log('[SendMessage] Conversation ID:', id);
        console.log('[SendMessage] Content:', content);
        const user = req.user?.profile;
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
        const convResult = await db_js_1.pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
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
        // Insert message
        console.log('[SendMessage] Inserting message...');
        const messageResult = await db_js_1.pool.query(`INSERT INTO messages (conversation_id, sender_id, sender_name, sender_avatar, content, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [id, userId, userName, userAvatar, content, isUserAdmin]);
        console.log('[SendMessage] Message inserted:', messageResult.rows[0].id);
        // Update conversation's last message
        await db_js_1.pool.query(`UPDATE conversations
       SET last_message = $1, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`, [content, id]);
        console.log('[SendMessage] Success - returning message');
        res.json({ message: messageResult.rows[0] });
    }
    catch (error) {
        console.error('[SendMessage] Error sending message:', error?.message, error?.stack);
        res.status(500).json({ error: 'Failed to send message' });
    }
};
// Register on both app and apiRouter to ensure they're matched
apiRouter.post('/conversations/:id/messages', messageLimiter, isAuthenticated, handleSendMessage);
app.post('/api/conversations/:id/messages', messageLimiter, isAuthenticated, handleSendMessage);
app.post('/myhub/api/conversations/:id/messages', messageLimiter, isAuthenticated, handleSendMessage);
// Create a new conversation handler (or get existing)
const handleCreateConversation = async (req, res) => {
    try {
        const user = req.user?.profile;
        const userId = user?.id;
        const userName = user?.username || user?.global_name || 'Unknown';
        const userAvatar = user?.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` : null;
        const conversation = await (0, db_js_1.getOrCreateConversation)(userId, userName, userAvatar);
        res.json({ conversation });
    }
    catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
};
app.post('/api/conversations', isAuthenticated, handleCreateConversation);
app.post('/myhub/api/conversations', isAuthenticated, handleCreateConversation);
// Delete a conversation handler (admin only)
const handleDeleteConversation = async (req, res) => {
    try {
        console.log('[DeleteConversation] Request received, path:', req.path);
        console.log('[DeleteConversation] Conversation ID:', req.params.id);
        console.log('[DeleteConversation] User authenticated:', req.isAuthenticated());
        console.log('[DeleteConversation] Is admin:', req.user?.profile?.id === process.env.ADMIN_DISCORD_ID);
        const { id } = req.params;
        // Delete all messages first (foreign key constraint)
        await db_js_1.pool.query('DELETE FROM messages WHERE conversation_id = $1', [id]);
        console.log('[DeleteConversation] Messages deleted');
        // Then delete the conversation
        await db_js_1.pool.query('DELETE FROM conversations WHERE id = $1', [id]);
        console.log('[DeleteConversation] Conversation deleted successfully');
        res.json({ success: true });
    }
    catch (error) {
        console.error('[DeleteConversation] Error:', error?.message, error?.stack);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
};
// Register on apiRouter as well to ensure they're matched
apiRouter.delete('/conversations/:id', isAdmin, handleDeleteConversation);
app.delete('/api/conversations/:id', isAdmin, handleDeleteConversation);
app.delete('/myhub/api/conversations/:id', isAdmin, handleDeleteConversation);
// Close a conversation handler (admin only)
const handleCloseConversation = async (req, res) => {
    try {
        console.log('[CloseConversation] Request received, path:', req.path);
        console.log('[CloseConversation] Conversation ID:', req.params.id);
        console.log('[CloseConversation] User authenticated:', req.isAuthenticated());
        console.log('[CloseConversation] Is admin:', req.user?.profile?.id === process.env.ADMIN_DISCORD_ID);
        const { id } = req.params;
        // Check if conversation uses 'status' or 'is_closed' field
        const convCheck = await db_js_1.pool.query('SELECT * FROM conversations WHERE id = $1 LIMIT 1', [id]);
        if (convCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        // Try is_closed first (more common), fallback to status
        const hasIsClosed = 'is_closed' in convCheck.rows[0];
        if (hasIsClosed) {
            await db_js_1.pool.query(`UPDATE conversations SET is_closed = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
        }
        else {
            await db_js_1.pool.query(`UPDATE conversations SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
        }
        console.log('[CloseConversation] Conversation closed successfully');
        res.json({ success: true });
    }
    catch (error) {
        console.error('[CloseConversation] Error:', error?.message, error?.stack);
        res.status(500).json({ error: 'Failed to close conversation' });
    }
};
// Register on apiRouter as well to ensure they're matched - MUST come before app.use('/myhub/api')
apiRouter.patch('/conversations/:id/close', isAdmin, handleCloseConversation);
app.patch('/api/conversations/:id/close', isAdmin, handleCloseConversation);
app.patch('/myhub/api/conversations/:id/close', isAdmin, handleCloseConversation);
// Reopen a conversation handler (admin only)
const handleReopenConversation = async (req, res) => {
    try {
        const { id } = req.params;
        await db_js_1.pool.query(`UPDATE conversations SET status = 'open', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error reopening conversation:', error);
        res.status(500).json({ error: 'Failed to reopen conversation' });
    }
};
// Register on apiRouter as well to ensure they're matched
apiRouter.patch('/conversations/:id/reopen', isAdmin, handleReopenConversation);
app.patch('/api/conversations/:id/reopen', isAdmin, handleReopenConversation);
app.patch('/myhub/api/conversations/:id/reopen', isAdmin, handleReopenConversation);
// Seed test messages (admin only)
const handleSeedTestMessages = async (req, res) => {
    try {
        const userId = req.user?.profile?.id;
        const adminId = process.env.ADMIN_DISCORD_ID;
        const isUserAdmin = userId === adminId;
        if (!isUserAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        // Get or create the admin's conversation
        const userName = req.user?.profile?.username || 'Admin';
        const userAvatar = req.user?.profile?.avatar
            ? `https://cdn.discordapp.com/avatars/${userId}/${req.user.profile.avatar}.png`
            : null;
        const conversation = await (0, db_js_1.getOrCreateConversation)(userId, userName, userAvatar);
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
            const messageResult = await db_js_1.pool.query(`INSERT INTO messages (conversation_id, sender_id, sender_name, sender_avatar, content, is_admin, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP - INTERVAL '${minutesAgo} minutes')
         RETURNING *`, [
                conversation.id,
                userId, // Use same user ID for testing
                msg.sender_name,
                userAvatar,
                msg.content,
                msg.is_admin
            ]);
            insertedMessages.push(messageResult.rows[0]);
        }
        // Update conversation's last message
        const lastMessage = testMessages[testMessages.length - 1];
        await db_js_1.pool.query(`UPDATE conversations
       SET last_message = $1, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`, [lastMessage.content, conversation.id]);
        res.json({
            success: true,
            conversation: conversation,
            messages: insertedMessages,
            message: `Added ${insertedMessages.length} test messages to your conversation`
        });
    }
    catch (error) {
        console.error('Error seeding test messages:', error);
        res.status(500).json({ error: 'Failed to seed test messages' });
    }
};
app.post('/api/admin/seed-test-messages', isAuthenticated, handleSeedTestMessages);
app.post('/myhub/api/admin/seed-test-messages', isAuthenticated, handleSeedTestMessages);
// API Proxy Routes
// apiRouter is already declared above - now register routes on it
// Lanyard route
const handleLanyard = async (req, res) => {
    console.log('[BACKEND] Lanyard handler CALLED - userId:', req.params?.userId || 'undefined', 'path:', req.path, 'originalUrl:', req.originalUrl, 'url:', req.url);
    try {
        const { userId } = req.params;
        const response = await axios_1.default.get(`https://api.lanyard.rest/v1/users/${userId}`);
        console.log('[BACKEND] Lanyard API success');
        res.json(response.data);
    }
    catch (error) {
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
app.get('/myhub/api/lanyard/:userId', (req, res) => {
    console.log('[BACKEND] DIRECT /myhub/api/lanyard route matched! path:', req.path);
    return handleLanyard(req, res);
});
// Discord profile endpoint (badges, banner, etc.) - Official Discord API
const handleDiscordProfile = async (req, res) => {
    console.log('[BACKEND] /api/discord/profile/:userId hit - userId:', req.params.userId, 'path:', req.path, 'originalUrl:', req.originalUrl);
    try {
        const { userId } = req.params;
        const botToken = process.env.DISCORD_BOT_TOKEN;
        if (!botToken) {
            return res.status(500).json({ error: 'Discord bot token not configured' });
        }
        // Fetch user data from official Discord API
        const userResponse = await axios_1.default.get(`https://discord.com/api/v10/users/${userId}`, {
            headers: {
                'Authorization': `Bot ${botToken}`,
                'User-Agent': 'MY-HUB-Dashboard/1.0'
            }
        });
        const userData = userResponse.data;
        const publicFlags = userData?.public_flags || 0;
        // Decode badge flags
        const badgeFlags = {
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
        const badges = [];
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
    }
    catch (error) {
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
app.get('/myhub/api/discord/profile/:userId', handleDiscordProfile);
const handleLastFm = async (req, res) => {
    console.log('[BACKEND] /api/lastfm/recent hit - path:', req.path, 'originalUrl:', req.originalUrl, 'method:', req.method);
    try {
        const username = process.env.LASTFM_USERNAME;
        const apiKey = process.env.LASTFM_API_KEY;
        if (!username || !apiKey) {
            return res.status(500).json({ error: 'Last.fm credentials not configured' });
        }
        const response = await axios_1.default.get('http://ws.audioscrobbler.com/2.0/', {
            params: {
                method: 'user.getrecenttracks',
                user: username,
                api_key: apiKey,
                format: 'json',
                limit: 1,
            },
        });
        res.json(response.data);
    }
    catch (error) {
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
app.get('/myhub/api/lastfm/recent', handleLastFm);
const handleWakaTime = async (req, res) => {
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
        const response = await axios_1.default.get(`https://wakatime.com/api/v1/users/${username}/summaries?start=${startDate}&end=${endDate}&api_key=${apiKey}`);
        // Transform summaries data to match the stats format
        const summaries = response.data.data || [];
        const languages = {};
        let totalSeconds = 0;
        let bestDay = null;
        let bestDaySeconds = 0;
        const editors = {};
        summaries.forEach((day) => {
            const dayTotal = day.grand_total?.total_seconds || 0;
            totalSeconds += dayTotal;
            if (dayTotal > bestDaySeconds) {
                bestDaySeconds = dayTotal;
                bestDay = {
                    date: day.range.date,
                    text: day.grand_total?.text || '0 secs'
                };
            }
            day.languages?.forEach((lang) => {
                if (!languages[lang.name]) {
                    languages[lang.name] = { name: lang.name, total_seconds: 0 };
                }
                languages[lang.name].total_seconds += lang.total_seconds || 0;
            });
            // Aggregate editor data
            day.editors?.forEach((editor) => {
                if (!editors[editor.name]) {
                    editors[editor.name] = { name: editor.name, total_seconds: 0 };
                }
                editors[editor.name].total_seconds += editor.total_seconds || 0;
            });
        });
        const languageArray = Object.values(languages)
            .sort((a, b) => b.total_seconds - a.total_seconds)
            .map((lang) => ({
            name: lang.name,
            total_seconds: lang.total_seconds,
            percent: totalSeconds > 0 ? Math.round((lang.total_seconds / totalSeconds) * 100 * 100) / 100 : 0,
            text: formatDuration(lang.total_seconds)
        }));
        const editorArray = Object.values(editors)
            .sort((a, b) => b.total_seconds - a.total_seconds)
            .map((editor) => ({
            name: editor.name,
            total_seconds: editor.total_seconds,
            percent: totalSeconds > 0 ? Math.round((editor.total_seconds / totalSeconds) * 100 * 100) / 100 : 0,
            text: formatDuration(editor.total_seconds)
        }));
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
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
    }
    catch (error) {
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
app.get('/myhub/api/wakatime/stats', handleWakaTime);
// System Specs endpoint - moved to be registered with other explicit routes
// Handler definition:
async function handleSystemSpecs(req, res) {
    try {
        console.log('[SystemSpecs] Request received, path:', req.path, 'originalUrl:', req.originalUrl);
        // VPS Specs (auto-detected)
        const cpus = os_1.default.cpus();
        const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown';
        const cpuCores = cpus.length;
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
        const usedMem = totalMem - freeMem;
        // Format memory in GB - always show 64 GB RAM for VPS
        const formatBytes = (bytes) => {
            // Always return 64 GB RAM for VPS (hardcoded as per user request)
            return '64 GB RAM';
        };
        // Calculate CPU usage
        // Get initial CPU times
        const initialCpus = os_1.default.cpus();
        const initialTotal = initialCpus.reduce((acc, cpu) => {
            return acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
        }, 0);
        const initialIdle = initialCpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
        // Wait 100ms and measure again to calculate usage
        await new Promise(resolve => setTimeout(resolve, 100));
        const finalCpus = os_1.default.cpus();
        const finalTotal = finalCpus.reduce((acc, cpu) => {
            return acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq;
        }, 0);
        const finalIdle = finalCpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
        // Calculate CPU usage percentage
        const totalDiff = finalTotal - initialTotal;
        const idleDiff = finalIdle - initialIdle;
        const cpuUsed = totalDiff - idleDiff;
        const cpuUsagePercent = totalDiff > 0 ? ((cpuUsed / totalDiff) * 100).toFixed(1) : '0.0';
        // Detect if AMD EPYC (common in VPS)
        const isAMDEPYC = cpuModel.includes('EPYC') || cpuModel.includes('AMD');
        const cpuInfo = isAMDEPYC ? `${cpuCores} vCPU AMD EPYC` : `${cpuCores} vCPU ${cpuModel}`;
        const vpsSpecs = {
            cpu: cpuInfo,
            cpuCores: cpuCores,
            cpuModel: cpuModel,
            cpuUsagePercent: cpuUsagePercent,
            ram: formatBytes(totalMem),
            ramTotal: totalMem,
            ramUsed: usedMem,
            ramFree: freeMem,
            ramUsedPercent: ((usedMem / totalMem) * 100).toFixed(1),
            storage: process.env.VPS_STORAGE || '960 GB NVMe',
            os: os_1.default.platform(),
            osRelease: os_1.default.release(),
            hostname: os_1.default.hostname(),
            nodeVersion: process.version,
        };
        // Mac Specs (from environment variables with defaults)
        const macSpecs = {
            model: process.env.MAC_MODEL || 'MacBook Pro 16-inch, 2023',
            cpu: process.env.MAC_CPU || 'Apple M2 Max',
            ram: process.env.MAC_RAM || '96 GB',
            storage: process.env.MAC_STORAGE || 'Macintosh HD',
            os: process.env.MAC_OS || 'Tahoe 26.1',
        };
        console.log('[SystemSpecs] Returning specs:', { mac: macSpecs, vps: vpsSpecs });
        res.json({
            mac: macSpecs,
            vps: vpsSpecs,
        });
    }
    catch (error) {
        console.error('[SystemSpecs] Error:', error?.message, error?.stack);
        res.status(500).json({ error: 'Failed to fetch system specs' });
    }
}
// CRITICAL: Register routes IMMEDIATELY after handler definition (EXACT same pattern as wakatime/lastfm)
apiRouter.get('/system/specs', handleSystemSpecs);
// Register EXACTLY like wakatime - inline handler to ensure it works
app.get('/myhub/api/system/specs', (req, res, next) => {
    console.log('[SystemSpecs Route] ✅ EXPRESS MATCHED!');
    return handleSystemSpecs(req, res).catch(next);
});
// CRITICAL: Register explicit /myhub/api/* routes BEFORE app.all to ensure they match first
app.get('/myhub/api/auth/user', authUserHandler);
app.post('/myhub/api/auth/logout', logoutHandler);
// Note: handleContactEmail route registered after function definition below
// CRITICAL: Mount API router for /api/* paths
app.use('/api', apiRouter);
// CRITICAL: Handle /myhub/api/* routes - forward to apiRouter (catch-all, must be LAST)
app.all('/myhub/api/*', (req, res, next) => {
    console.log('[app.all] ✅ CALLED! path:', req.path, 'originalUrl:', req.originalUrl);
    // Handle system specs FIRST - direct call since explicit route isn't matching
    if (req.path === '/myhub/api/system/specs' || req.originalUrl === '/myhub/api/system/specs' ||
        req.path.includes('system/specs') || req.originalUrl.includes('system/specs')) {
        console.log('[app.all] ✅ System specs matched, calling handler');
        return handleSystemSpecs(req, res).catch(next);
    }
    // For all other routes, modify url and forward to apiRouter
    const originalUrl = req.url;
    const originalOriginalUrl = req.originalUrl;
    // Strip /myhub/api from url
    req.url = req.url.replace('/myhub/api', '') || '/';
    if (req.originalUrl) {
        const modifiedOriginalUrl = req.originalUrl.replace('/myhub/api', '') || '/';
        req.originalUrl = modifiedOriginalUrl;
    }
    // Forward to apiRouter
    apiRouter(req, res, (err) => {
        // Restore original values
        req.url = originalUrl;
        req.originalUrl = originalOriginalUrl;
        if (err) {
            console.log('[app.all /myhub/api/*] apiRouter error:', err);
        }
        next(err);
    });
});
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0)
        return `${hours} hrs ${mins} mins`;
    if (mins > 0)
        return `${mins} mins`;
    return `${seconds} secs`;
}
// Contact Form Routes
app.post('/api/contact/discord', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
        const { message } = req.body;
        const user = req.user;
        // Send DM via Discord (requires bot setup or webhook)
        // For now, we'll send an email notification
        const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
        await transporter.sendMail({
            from: fromEmail, // Plain email address
            to: process.env.SMTP_USER,
            subject: `MY HUB Contact from ${user.profile.username}`,
            text: `Message from Discord user ${user.profile.username}#${user.profile.discriminator}:\n\n${message}`,
            html: `
        <h3>Message from Discord user ${user.profile.username}#${user.profile.discriminator}</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Discord message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
const handleContactEmail = async (req, res) => {
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
            subject: `MY HUB Contact: ${subject} (from ${name})`,
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
        const mailOptions = {
            from: fromEmail, // Plain email address - no display name
            to: email,
            replyTo: process.env.SMTP_USER, // When user replies, it goes to connectwithme@epildevconnect.uk
            subject: `Re: ${subject}`,
            text: `Hi ${name},\n\nThank you for reaching out! I've received your message regarding "${subject}" and will get back to you as soon as possible.\n\nYour message:\n${message}\n\nBest regards,\nBlake (@epildev)\nMY HUB - EpilDevConnect`,
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
                          MY HUB
                        </h1>
                        <p style="margin: 10px 0 0; font-size: 14px; color: #8899aa; font-family: 'Courier New', monospace;">
                          by EpilDevConnect
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
                          Senior IT App Developer | Music Producer
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #8899aa;">
                          Hythe, Southampton, England
                        </p>
                        <div style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                          <p style="margin: 0; font-size: 12px; color: #666; font-family: 'Courier New', monospace;">
                            © 2025 MY HUB by EpilDevConnect. All rights reserved.
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
    }
    catch (error) {
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
app.post('/myhub/api/contact/email', handleContactEmail);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// CRITICAL: Serve static files ONLY for non-API paths
// Use a more restrictive path pattern that excludes /api and /auth
// CRITICAL: This middleware MUST run AFTER all API routes
app.use('/myhub', (req, res, next) => {
    // CRITICAL: Skip static file serving for API/auth paths
    // Check both req.path AND req.originalUrl to catch all API paths
    const path = req.path;
    const originalUrl = req.originalUrl;
    const isApiPath = (path && (path.startsWith('/api') || path.startsWith('/auth'))) ||
        (originalUrl && (originalUrl.startsWith('/myhub/api') || originalUrl.startsWith('/myhub/auth') ||
            originalUrl.startsWith('/api') || originalUrl.startsWith('/auth')));
    if (isApiPath) {
        console.log('[BACKEND] Static middleware skipping API path:', path, 'originalUrl:', originalUrl);
        return next(); // Let API route handlers deal with it (should have already, but safety check)
    }
    // Serve static files for other /myhub/* paths (frontend pages only)
    const staticHandler = express_1.default.static('dist');
    staticHandler(req, res, next);
});
// Handle client-side routing - send index.html for /myhub routes (but not /myhub/api/* or /myhub/auth/*)
// CRITICAL: This MUST come AFTER all API/auth routes to avoid intercepting them
app.get('/myhub/*', (req, res, next) => {
    // CRITICAL: Double-check - skip API/auth paths even though they should have been handled above
    const path = req.path;
    const originalUrl = req.originalUrl;
    const isApiOrAuth = (path && (path.startsWith('/myhub/api') || path.startsWith('/myhub/auth') ||
        path.startsWith('/api') || path.startsWith('/auth'))) ||
        (originalUrl && (originalUrl.startsWith('/myhub/api') || originalUrl.startsWith('/myhub/auth') ||
            originalUrl.startsWith('/api') || originalUrl.startsWith('/auth')));
    if (isApiOrAuth) {
        console.log('[BACKEND] Client-side routing skipping API/auth path:', path, 'originalUrl:', originalUrl);
        return next(); // Let API routes or 404 handler deal with it
    }
    res.sendFile('index.html', { root: 'dist' });
});
// Redirect root to /myhub/home
app.get('/', (req, res) => {
    res.redirect('/myhub/home');
});
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    // Don't expose error details in production
    const isDev = process.env.NODE_ENV === 'development';
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(isDev && { stack: err.stack }),
    });
});
// Initialize database and start server
async function startServer() {
    try {
        await (0, db_js_1.initializeDatabase)();
        app.listen(PORT, () => {
            console.log(`🚀 Backend server running on port ${PORT}`);
            console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
            console.log(`💬 Discord DM system initialized`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
