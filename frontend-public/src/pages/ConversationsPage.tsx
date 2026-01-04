import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { conversationsApi } from '../api/conversations';
import { membersApi } from '../api/members';
import { ConversationCard } from '../components/conversations/ConversationCard';
import { Loading } from '../components/common/Loading';

export function ConversationsPage() {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', selectedMemberId],
    queryFn: () => conversationsApi.getAll(selectedMemberId || undefined),
  });

  const { data: members } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-800 mb-4">ミーグリレポ</h1>
          <p className="text-slate-600">ミーグリでの会話を記録・管理しましょう</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          {/* Member filter */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="member-filter" className="text-sm font-medium text-slate-700">
              メンバー:
            </label>
            <select
              id="member-filter"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">すべて</option>
              {members?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Create button */}
          <Link
            to="/conversations/new"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規作成
          </Link>
        </motion.div>

        {/* Conversation list */}
        {conversations && conversations.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <ConversationCard conversation={conversation} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <svg
              className="w-24 h-24 mx-auto text-slate-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-slate-500 mb-4">
              {selectedMemberId ? '該当するミーグリレポがありません' : 'ミーグリレポがありません'}
            </p>
            <Link
              to="/conversations/new"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              最初の会話を記録する
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
