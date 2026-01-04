import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { songsApi } from '../api/songs';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';

export function SongsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const { data: songs, isLoading } = useQuery({
    queryKey: ['songs', selectedGroupId],
    queryFn: () => selectedGroupId ? songsApi.getByGroup(selectedGroupId) : songsApi.getAll(),
  });

  const getGroupName = (groupId: string) => {
    return groups?.find((g) => g.id === groupId)?.name ?? '';
  };

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary-800 mb-4">
            Songs
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            珠玉の楽曲たち
          </p>
        </motion.div>

        {/* グループフィルター */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          <button
            onClick={() => setSelectedGroupId('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedGroupId === ''
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            すべて
          </button>
          {groups?.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGroupId === group.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {group.name}
            </button>
          ))}
        </motion.div>

        {/* 楽曲リスト */}
        <div className="space-y-4">
          {songs?.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Link
                to={`/songs/${song.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-slate-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary-800 mb-1">
                      {song.title}
                    </h3>
                    <p className="text-sm text-primary-500 font-medium mb-2">
                      {getGroupName(song.groupId)}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span>作詞: {song.lyricist}</span>
                      <span>作曲: {song.composer}</span>
                      {song.arranger && <span>編曲: {song.arranger}</span>}
                    </div>
                  </div>
                  <div className="text-primary-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {songs?.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            楽曲が登録されていません
          </div>
        )}
      </div>
    </div>
  );
}
