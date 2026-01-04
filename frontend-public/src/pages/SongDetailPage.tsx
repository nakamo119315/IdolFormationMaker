import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { songsApi } from '../api/songs';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';

export function SongDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: song, isLoading: songLoading } = useQuery({
    queryKey: ['song', id],
    queryFn: () => songsApi.getById(id!),
    enabled: !!id,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  if (songLoading) return <Loading />;
  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-600/70 mb-4">楽曲が見つかりません</p>
          <Link to="/songs" className="text-primary-500 hover:underline">
            楽曲一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const groupName = groups?.find((g) => g.id === song.groupId)?.name ?? '';

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 戻るリンク */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/songs"
            className="inline-flex items-center text-primary-600/70 hover:text-primary-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            楽曲一覧に戻る
          </Link>
        </motion.div>

        {/* メタ情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-100"
        >
          <div className="text-center mb-6">
            <p className="text-primary-500 font-medium mb-2">{groupName}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-700 mb-4">
              {song.title}
            </h1>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-primary-600/70 mb-1">作詞</p>
              <p className="font-medium text-slate-800">{song.lyricist}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-primary-600/70 mb-1">作曲</p>
              <p className="font-medium text-slate-800">{song.composer}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-primary-600/70 mb-1">編曲</p>
              <p className="font-medium text-slate-800">{song.arranger || '-'}</p>
            </div>
          </div>
        </motion.div>

        {/* 歌詞 */}
        {song.lyrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100"
          >
            <h2 className="text-xl font-bold text-primary-700 mb-6 text-center">
              歌詞
            </h2>
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-center">
              {song.lyrics}
            </div>
          </motion.div>
        )}

        {!song.lyrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-50 rounded-2xl p-8 text-center"
          >
            <p className="text-primary-600/70">歌詞は登録されていません</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
