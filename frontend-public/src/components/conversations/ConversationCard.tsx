import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ConversationSummary } from '../../types';

interface ConversationCardProps {
  conversation: ConversationSummary;
}

export function ConversationCard({ conversation }: ConversationCardProps) {
  const formattedDate = new Date(conversation.conversationDate).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link to={`/conversations/${conversation.id}`}>
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
        className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-300 border border-slate-100"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2 flex-1">
            {conversation.title}
          </h3>
          <span className="flex-shrink-0 ml-3 px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
            {conversation.messageCount}件
          </span>
        </div>

        {/* Member info */}
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm text-slate-600">
            {conversation.memberName || 'メンバー未設定'}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-slate-600">{formattedDate}</span>
        </div>

        {/* Preview text */}
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {conversation.previewText}
        </p>
      </motion.div>
    </Link>
  );
}
