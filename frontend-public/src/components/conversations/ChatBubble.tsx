import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ConversationMessage } from '../../types';

interface ChatBubbleProps {
  message: ConversationMessage;
  isOwn: boolean;
  partnerName?: string;
  onEdit?: (content: string) => void;
  onDelete?: () => void;
}

export function ChatBubble({ message, isOwn, partnerName = '相手', onEdit, onDelete }: ChatBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
    >
      <div className={`max-w-[75%] sm:max-w-[60%] relative`}>
        {/* Speaker indicator */}
        <div className={`text-xs text-slate-500 mb-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {isOwn ? '自分' : partnerName}
        </div>

        {/* Message bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl break-words ${
            isOwn
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
              : 'bg-slate-200 text-slate-800 rounded-bl-sm'
          }`}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 text-sm text-slate-800 rounded border border-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm sm:text-base whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Edit/Delete buttons - always visible on mobile, hover on desktop */}
        {!isEditing && (onEdit || onDelete) && (
          <div className={`flex gap-1 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-2 py-1 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded active:bg-blue-100"
              >
                編集
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-2 py-1 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded active:bg-red-100"
              >
                削除
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
