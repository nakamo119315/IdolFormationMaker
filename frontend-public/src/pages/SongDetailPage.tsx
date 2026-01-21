import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { songsApi } from '../api/songs';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';

export function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: song, isLoading: songLoading } = useQuery({
    queryKey: ['song', id],
    queryFn: () => songsApi.getById(id!),
    enabled: !!id,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: () => songsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      navigate('/songs');
    },
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
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-100 relative"
        >
          {/* 編集・削除ボタン（右上に配置） */}
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <Link
              to={`/songs/${id}/edit`}
              className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
              title="編集"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="削除"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div className="text-center mb-6">
            <p className="text-primary-500 font-medium mb-2">{groupName}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-700 px-12">
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

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">曲を削除</h3>
            <p className="text-slate-600 mb-6">
              「{song.title}」を削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? '削除中...' : '削除'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
