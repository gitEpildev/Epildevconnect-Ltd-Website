import { motion } from 'framer-motion';
import { User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  isAdmin: boolean;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  isAdmin,
}: ConversationListProps) {
  return (
    <div className="w-full lg:w-80 border-r border-white border-opacity-10 flex flex-col bg-white bg-opacity-5 min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-white border-opacity-10">
        <h2 className="font-mono font-semibold text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-quantum-glow" />
          {isAdmin ? 'All Conversations' : 'Messages'}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
        </p>
      </div>

      {/* Conversation List */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No conversations yet</p>
            {!isAdmin && (
              <p className="text-xs mt-2">Start a conversation by contacting support</p>
            )}
          </div>
        ) : (
          conversations.map((conversation) => (
            <motion.button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`
                w-full p-4 text-left transition-all duration-200
                border-b border-white border-opacity-5
                hover:bg-white hover:bg-opacity-10
                ${selectedConversation?.id === conversation.id
                  ? 'bg-white bg-opacity-10 border-l-4 border-l-quantum-glow'
                  : ''
                }
              `}
              whileHover={{ x: 4 }}
            >
              {/* User Info */}
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {conversation.user_avatar ? (
                    <img
                      src={conversation.user_avatar}
                      alt={conversation.user_name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-quantum-glow bg-opacity-20 flex items-center justify-center">
                      <User className="w-6 h-6 text-quantum-glow" />
                    </div>
                  )}
                  {/* Status Badge */}
                  {conversation.status === 'closed' && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-500 border-2 border-dark-800 flex items-center justify-center">
                      <span className="text-[8px] font-bold">✕</span>
                    </div>
                  )}
                </div>

                {/* Message Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">
                      {conversation.user_name}
                    </h3>
                    {conversation.last_message_at && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {conversation.last_message && (
                    <p className="text-sm text-gray-400 truncate">
                      {conversation.last_message}
                    </p>
                  )}
                  {conversation.status === 'closed' && (
                    <span className="inline-block text-xs text-gray-500 mt-1 px-2 py-0.5 rounded bg-gray-700">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}

