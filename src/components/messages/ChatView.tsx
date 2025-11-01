import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Lock, Unlock, MessageSquare, User, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const api = axios.create({
  baseURL: '/myhub', // Use /myhub base to match routing
  withCredentials: true,
});

interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  content: string;
  is_admin: boolean;
  created_at: string;
}

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

interface ChatViewProps {
  conversation: Conversation | null;
  user: any;
  isAdmin: boolean;
  onDelete: (conversationId: number) => void;
  onClose: (conversationId: number) => void;
  onReopen: (conversationId: number) => void;
  onBack?: () => void;
}

export default function ChatView({
  conversation,
  user,
  isAdmin,
  onDelete,
  onClose,
  onReopen,
  onBack,
}: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation) {
      fetchMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [conversation?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!conversation) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/api/conversations/${conversation.id}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await api.post(`/api/conversations/${conversation.id}/messages`, {
        content: newMessage.trim(),
      });
      
      setMessages([...messages, response.data.message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error: any) {
      console.error('Failed to send message:', error?.response?.status, error?.response?.data, error?.message);
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to send message. Please try again.';
      alert(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-mono">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  const currentUserId = user?.profile?.id;
  const isClosed = conversation.status === 'closed';

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-white border-opacity-10 flex items-center justify-between bg-white bg-opacity-5">
        <div className="flex items-center gap-3">
          {/* Back Button - Mobile Only */}
          {onBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="lg:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all"
              title="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5 text-quantum-glow" />
            </motion.button>
          )}
          
          {conversation.user_avatar ? (
            <img
              src={conversation.user_avatar}
              alt={conversation.user_name}
              className="w-10 h-10 rounded-full ring-2 ring-quantum-glow"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-quantum-glow bg-opacity-20 flex items-center justify-center">
              <User className="w-5 h-5 text-quantum-glow" />
            </div>
          )}
          <div>
            <h2 className="font-semibold">{conversation.user_name}</h2>
            <p className="text-xs text-gray-500">
              {isClosed ? 'Conversation Closed' : 'Active Conversation'}
            </p>
          </div>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            {isClosed ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onReopen(conversation.id)}
                className="px-3 py-1.5 rounded-lg bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30 transition-all text-sm font-mono flex items-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Reopen
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onClose(conversation.id)}
                className="px-3 py-1.5 rounded-lg bg-yellow-500 bg-opacity-20 text-yellow-400 hover:bg-opacity-30 transition-all text-sm font-mono flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Close
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
                  onDelete(conversation.id);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30 transition-all text-sm font-mono flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </motion.button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-quantum-glow animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              const isAdminMessage = message.is_admin;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Sender Info */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      {!isOwnMessage && message.sender_avatar && (
                        <img
                          src={message.sender_avatar}
                          alt={message.sender_name}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className="text-xs font-semibold">
                        {isOwnMessage ? 'You' : message.sender_name}
                        {isAdminMessage && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-quantum-glow bg-opacity-20 text-quantum-glow text-[10px]">
                            ADMIN
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`
                        px-4 py-2.5 rounded-2xl
                        ${isOwnMessage
                          ? 'bg-quantum-glow bg-opacity-20 text-white rounded-br-sm'
                          : 'bg-white bg-opacity-10 text-gray-100 rounded-bl-sm'
                        }
                      `}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {!isClosed ? (
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white border-opacity-10 bg-white bg-opacity-5">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-10 focus:border-quantum-glow focus:outline-none transition-all font-mono text-sm"
              disabled={isSending}
            />
            <motion.button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-xl bg-quantum-glow text-dark-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </motion.button>
          </div>
        </form>
      ) : (
        <div className="p-4 border-t border-white border-opacity-10 bg-white bg-opacity-5 text-center">
          <p className="text-sm text-gray-500 font-mono">
            <Lock className="w-4 h-4 inline mr-2" />
            This conversation is closed
            {isAdmin && ' - Reopen to continue messaging'}
          </p>
        </div>
      )}
    </div>
  );
}

