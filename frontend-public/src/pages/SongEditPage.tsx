import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { songsApi } from '../api/songs';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';

export function SongEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const initializedRef = useRef(false);

  const [title, setTitle] = useState('');
  const [groupId, setGroupId] = useState('');
  const [lyricist, setLyricist] = useState('');
  const [composer, setComposer] = useState('');
  const [arranger, setArranger] = useState('');
  const [lyrics, setLyrics] = useState('');

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const { data: song, isLoading: songLoading } = useQuery({
    queryKey: ['song', id],
    queryFn: () => songsApi.getById(id!),
    enabled: isEditing,
  });

  // Initialize form when song data is loaded (only once)
  useEffect(() => {
    if (song && !initializedRef.current) {
      initializedRef.current = true;
      setTitle(song.title);
      setGroupId(song.groupId);
      setLyricist(song.lyricist);
      setComposer(song.composer);
      setArranger(song.arranger ?? '');
      setLyrics(song.lyrics ?? '');
    }
  }, [song]);

  const createMutation = useMutation({
    mutationFn: songsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      navigate('/songs');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof songsApi.update>[1] }) =>
      songsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['song', variables.id] });
      navigate(`/songs/${variables.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !groupId || !lyricist || !composer) return;

    const data = {
      title,
      groupId,
      lyricist,
      composer,
      arranger: arranger || null,
      lyrics: lyrics || null,
    };

    if (isEditing) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (groupsLoading || (isEditing && songLoading)) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <button
            onClick={() => navigate(isEditing ? `/songs/${id}` : '/songs')}
            className="flex items-center text-primary-600 hover:text-primary-500 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-800">
            {isEditing ? '曲編集' : '新規曲'}
          </h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-6"
        >
          {/* 基本情報 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary-800">基本情報</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                曲名 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                placeholder="例: サイレントマジョリティー"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                グループ *
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                required
              >
                <option value="">グループを選択</option>
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* クレジット */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary-800">クレジット</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                作詞 *
              </label>
              <input
                type="text"
                value={lyricist}
                onChange={(e) => setLyricist(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                placeholder="例: 秋元康"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                作曲 *
              </label>
              <input
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                placeholder="例: バグベア"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                編曲
              </label>
              <input
                type="text"
                value={arranger}
                onChange={(e) => setArranger(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                placeholder="例: バグベア"
              />
            </div>
          </div>

          {/* 歌詞 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary-800">歌詞</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                歌詞
              </label>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors min-h-[200px]"
                placeholder="歌詞を入力..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate(isEditing ? `/songs/${id}` : '/songs')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!title || !groupId || !lyricist || !composer || createMutation.isPending || updateMutation.isPending}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30"
            >
              {createMutation.isPending || updateMutation.isPending
                ? '保存中...'
                : isEditing
                ? '更新'
                : '作成'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
