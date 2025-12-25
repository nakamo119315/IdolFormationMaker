import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { songsApi } from '../api/songs';
import { groupsApi } from '../api/groups';
import { Modal } from '../components/common/Modal';
import type { SongSummary, CreateSongDto, UpdateSongDto } from '../types';

export function SongsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLyricsModalOpen, setIsLyricsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<SongSummary | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [currentLyrics, setCurrentLyrics] = useState<{ title: string; lyrics: string }>({ title: '', lyrics: '' });
  const [formData, setFormData] = useState<CreateSongDto>({
    groupId: '',
    title: '',
    lyricist: '',
    composer: '',
    arranger: null,
    lyrics: null,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const { data: songs, isLoading } = useQuery({
    queryKey: ['songs', selectedGroupId],
    queryFn: () => selectedGroupId ? songsApi.getByGroup(selectedGroupId) : songsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: songsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSongDto }) =>
      songsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: songsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
  });

  const openCreateModal = () => {
    setEditingSong(null);
    setFormData({
      groupId: selectedGroupId || '',
      title: '',
      lyricist: '',
      composer: '',
      arranger: null,
      lyrics: null,
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (song: SongSummary) => {
    const fullSong = await songsApi.getById(song.id);
    setEditingSong(song);
    setFormData({
      groupId: song.groupId,
      title: fullSong.title,
      lyricist: fullSong.lyricist,
      composer: fullSong.composer,
      arranger: fullSong.arranger,
      lyrics: fullSong.lyrics,
    });
    setIsModalOpen(true);
  };

  const openLyricsModal = async (song: SongSummary) => {
    const fullSong = await songsApi.getById(song.id);
    setCurrentLyrics({ title: fullSong.title, lyrics: fullSong.lyrics || '' });
    setIsLyricsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSong(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSong) {
      updateMutation.mutate({
        id: editingSong.id,
        data: {
          title: formData.title,
          lyricist: formData.lyricist,
          composer: formData.composer,
          arranger: formData.arranger,
          lyrics: formData.lyrics,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('削除してもよろしいですか？')) {
      deleteMutation.mutate(id);
    }
  };

  const getGroupName = (groupId: string) => {
    return groups?.find((g) => g.id === groupId)?.name ?? '-';
  };

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>楽曲管理</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            style={{ padding: '0.5rem' }}
          >
            <option value="">全グループ</option>
            {groups?.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={openCreateModal}>
            新規登録
          </button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>曲名</th>
            <th>グループ</th>
            <th>作詞</th>
            <th>作曲</th>
            <th>編曲</th>
            <th>歌詞</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {songs?.map((song) => (
            <tr key={song.id}>
              <td>{song.title}</td>
              <td>{getGroupName(song.groupId)}</td>
              <td>{song.lyricist}</td>
              <td>{song.composer}</td>
              <td>{song.arranger ?? '-'}</td>
              <td>
                <button
                  className="btn btn-sm"
                  onClick={() => openLyricsModal(song)}
                >
                  表示
                </button>
              </td>
              <td>
                <button
                  className="btn btn-sm"
                  onClick={() => openEditModal(song)}
                >
                  編集
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(song.id)}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSong ? '楽曲編集' : '楽曲登録'}
      >
        <form onSubmit={handleSubmit}>
          {!editingSong && (
            <div className="form-group">
              <label>グループ</label>
              <select
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                required
              >
                <option value="">選択してください</option>
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>曲名</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>作詞</label>
            <input
              type="text"
              value={formData.lyricist}
              onChange={(e) => setFormData({ ...formData, lyricist: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>作曲</label>
            <input
              type="text"
              value={formData.composer}
              onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>編曲（任意）</label>
            <input
              type="text"
              value={formData.arranger ?? ''}
              onChange={(e) => setFormData({ ...formData, arranger: e.target.value || null })}
            />
          </div>
          <div className="form-group">
            <label>歌詞（任意）</label>
            <textarea
              value={formData.lyrics ?? ''}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value || null })}
              rows={10}
              style={{ width: '100%', fontFamily: 'inherit' }}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={closeModal}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSong ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isLyricsModalOpen}
        onClose={() => setIsLyricsModalOpen(false)}
        title={`歌詞 - ${currentLyrics.title}`}
      >
        <div style={{ whiteSpace: 'pre-wrap', maxHeight: '60vh', overflow: 'auto' }}>
          {currentLyrics.lyrics || '歌詞が登録されていません'}
        </div>
        <div className="form-actions" style={{ marginTop: '1rem' }}>
          <button className="btn" onClick={() => setIsLyricsModalOpen(false)}>
            閉じる
          </button>
        </div>
      </Modal>
    </div>
  );
}
