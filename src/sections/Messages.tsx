import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2, LogOut } from 'lucide-react';
import ConversationList from '../components/messages/ConversationList';
import ChatView from '../components/messages/ChatView';
import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
});

interface Conversation {
  id: number;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  last_message: string | null;
  last_message_at: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Messages() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch conversations when authenticated
  useEffect(() => {
    if (user) {
      fetchConversations();
      // Poll for new conversations every 5 seconds
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/user');
      if (response.data.user) {
        setUser(response.data.user);
        // Remove auth=success query param if present
        if (window.location.search.includes('auth=success')) {
          window.history.replaceState({}, '', '/messages');
        }
      }
      // Always stop loading - don't redirect, don't retry
      setIsLoading(false);
    } catch (error: any) {
      console.error('[Messages] Auth check failed:', error);
      setIsLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/api/conversations');
      setConversations(response.data.conversations);
      setIsAdmin(response.data.isAdmin);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      console.log('[Messages] Deleting conversation:', conversationId);
      const response = await api.delete(`/api/conversations/${conversationId}`);
      console.log('[Messages] Delete response:', response.data);
      setConversations(conversations.filter(c => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error: any) {
      console.error('Failed to delete conversation:', error?.response?.status, error?.response?.data, error?.message);
      alert(error?.response?.data?.error || 'Failed to delete conversation');
    }
  };

  const handleCloseConversation = async (conversationId: number) => {
    try {
      console.log('[Messages] Closing conversation:', conversationId);
      const response = await api.patch(`/api/conversations/${conversationId}/close`);
      console.log('[Messages] Close response:', response.data);
      fetchConversations();
    } catch (error: any) {
      console.error('Failed to close conversation:', error?.response?.status, error?.response?.data, error?.message);
      alert(error?.response?.data?.error || 'Failed to close conversation');
    }
  };

  const handleReopenConversation = async (conversationId: number) => {
    try {
      await api.patch(`/api/conversations/${conversationId}/reopen`);
      fetchConversations();
    } catch (error) {
      console.error('Failed to reopen conversation:', error);
    }
  };

  const handleCreateConversation = async () => {
    try {
      setIsCreatingConversation(true);
      const response = await api.post('/api/conversations');
      const newConversation = response.data.conversation;
      setConversations([newConversation, ...conversations]);
      setSelectedConversation(newConversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to start a new conversation. Please try again.');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      window.location.href = '/home';
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-quantum-glow animate-spin" />
          <p className="text-gray-400 font-mono">Loading messages...</p>
          {!user && (
            <p className="text-sm text-gray-500 mt-2 font-mono">
              If this takes too long, you may need to log in
            </p>
          )}
        </div>
      </div>
    );
  }

  // If no user after loading, show a message instead of redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-quantum-glow opacity-50" />
          <h2 className="text-2xl font-bold mb-2 section-heading">Authentication Required</h2>
          <p className="text-gray-400 mb-6 font-mono">
            You need to be logged in to view messages.
          </p>
          <motion.button
            onClick={() => window.location.href = '/auth/discord'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl bg-quantum-glow text-dark-900 font-mono font-semibold hover:opacity-90 transition-all"
          >
            Login with Discord
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-20 lg:px-12 lg:py-24 pb-32">
      <div className="max-w-7xl mx-auto h-[calc(100vh-16rem)] min-h-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-8 h-8 text-quantum-glow" />
              <h1 className="text-5xl lg:text-7xl font-bold section-heading tracking-tight">
                Messages
              </h1>
            </div>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-xl bg-white bg-opacity-10 hover:bg-opacity-20 transition-all flex items-center gap-2 text-gray-300 hover:text-white font-mono"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </motion.button>
          </div>
          <p className="text-xl text-gray-400 font-mono">
            {isAdmin ? 'Admin View - All Conversations' : 'Your Direct Messages'}
          </p>
        </motion.div>

        {/* Discord-like Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass rounded-2xl overflow-hidden h-full min-h-0 flex flex-col lg:flex-row"
        >
          {/* Conversation List Sidebar - Hidden on mobile when chat is open */}
          <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-auto h-full min-h-0`}>
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="w-16 h-16 text-quantum-glow opacity-50 mb-4" />
                <h3 className="text-xl font-mono text-gray-300 mb-2">
                  {isAdmin ? 'No conversations yet' : 'No conversations yet'}
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                  {isAdmin 
                    ? 'Users can start conversations by contacting you' 
                    : 'Start a conversation with @epildev'}
                </p>
                {isAdmin ? (
                  <motion.button
                    onClick={async () => {
                      try {
                        const response = await api.post('/api/admin/seed-test-messages');
                        alert(response.data.message || 'Test messages added! Refresh the page.');
                        fetchConversations();
                      } catch (error) {
                        alert('Failed to seed test messages');
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl bg-quantum-glow text-dark-900 font-mono font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Add Test Messages
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleCreateConversation}
                    disabled={isCreatingConversation}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl bg-quantum-glow text-dark-900 font-mono font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCreatingConversation ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-5 h-5" />
                        Start Conversation
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            ) : (
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                isAdmin={isAdmin}
              />
            )}
          </div>

          {/* Chat View - Shows on mobile only when conversation selected */}
          <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-col flex-1 h-full min-h-0`}>
            <ChatView
              conversation={selectedConversation}
              user={user}
              isAdmin={isAdmin}
              onDelete={handleDeleteConversation}
              onClose={handleCloseConversation}
              onReopen={handleReopenConversation}
              onBack={() => setSelectedConversation(null)}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

