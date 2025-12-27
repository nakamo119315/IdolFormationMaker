import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { songsApi } from '../api/songs';
import { groupsApi } from '../api/groups';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast, type ToastMessage } from '../components/common/Toast';
import { Pagination } from '../components/common/Pagination';
import { SearchForm } from '../components/common/SearchForm';
import { SkeletonTable } from '../components/common/Skeleton';
import { createSongSchema, updateSongSchema } from '../validation/schemas';
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ページング・検索
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 20;

  // 削除確認ダイアログ
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // トースト
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const { data: pagedData, isLoading, error } = useQuery({
    queryKey: ['songs', 'paged', page, pageSize, search, selectedGroupId],
    queryFn: () => songsApi.getPaged({ page, pageSize, search, groupId: selectedGroupId || undefined }),
  });

  const songs = pagedData?.items;

  const createMutation = useMutation({
    mutationFn: songsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      closeModal();
      addToast('success', '楽曲を登録しました');
    },
    onError: () => {
      addToast('error', '楽曲の登録に失敗しました');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSongDto }) =>
      songsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      closeModal();
      addToast('success', '楽曲情報を更新しました');
    },
    onError: () => {
      addToast('error', '楽曲情報の更新に失敗しました');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: songsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      setDeleteTarget(null);
      addToast('success', '楽曲を削除しました');
    },
    onError: () => {
      addToast('error', '楽曲の削除に失敗しました');
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
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = async (song: SongSummary) => {
    try {
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
      setFormErrors({});
      setIsModalOpen(true);
    } catch {
      addToast('error', '楽曲情報の取得に失敗しました');
    }
  };

  const openLyricsModal = async (song: SongSummary) => {
    try {
      const fullSong = await songsApi.getById(song.id);
      setCurrentLyrics({ title: fullSong.title, lyrics: fullSong.lyrics || '' });
      setIsLyricsModalOpen(true);
    } catch {
      addToast('error', '歌詞の取得に失敗しました');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSong(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 編集時と新規作成時で異なるスキーマを使用
    const schema = editingSong ? updateSongSchema : createSongSchema;
    const dataToValidate = editingSong
      ? { title: formData.title, lyricist: formData.lyricist, composer: formData.composer, arranger: formData.arranger, lyrics: formData.lyrics }
      : formData;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
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

  const handleDelete = (song: SongSummary) => {
    setDeleteTarget({ id: song.id, title: song.title });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const getGroupName = (groupId: string) => {
    return groups?.find((g) => g.id === groupId)?.name ?? '-';
  };

  if (error) {
    return (
      <div className="page">
        <div className="error-message">
          <p>データの読み込みに失敗しました</p>
          <button className="btn btn-primary" onClick={() => queryClient.invalidateQueries({ queryKey: ['songs'] })}>
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleGroupFilter = (groupId: string) => {
    setSelectedGroupId(groupId);
    setPage(1);
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await songsApi.exportCsv();
      addToast('success', 'CSVをダウンロードしました');
    } catch {
      addToast('error', 'CSVエクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="page-header">
        <h1>楽曲管理</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className="btn"
            onClick={handleExportCsv}
            disabled={isExporting}
          >
            {isExporting ? 'エクスポート中...' : 'CSVエクスポート'}
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            新規登録
          </button>
        </div>
      </div>

      <div className="filter-section">
        <SearchForm
          initialValue={search}
          onSearch={handleSearch}
          placeholder="曲名・作詞・作曲で検索..."
        />
        <div className="filter-group">
          <label>グループ:</label>
          <select
            value={selectedGroupId}
            onChange={(e) => handleGroupFilter(e.target.value)}
          >
            <option value="">全グループ</option>
            {groups?.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
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
        {isLoading ? (
          <SkeletonTable rows={10} columns={7} />
        ) : (
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
                    onClick={() => handleDelete(song)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {pagedData && (
        <Pagination
          currentPage={pagedData.page}
          totalPages={pagedData.totalPages}
          totalCount={pagedData.totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="楽曲の削除"
        message={`「${deleteTarget?.title}」を削除してもよろしいですか？`}
        confirmLabel="削除"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

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
                className={formErrors.groupId ? 'input-error' : ''}
              >
                <option value="">選択してください</option>
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {formErrors.groupId && <span className="error-text">{formErrors.groupId}</span>}
            </div>
          )}
          <div className="form-group">
            <label>曲名</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={formErrors.title ? 'input-error' : ''}
            />
            {formErrors.title && <span className="error-text">{formErrors.title}</span>}
          </div>
          <div className="form-group">
            <label>作詞</label>
            <input
              type="text"
              value={formData.lyricist}
              onChange={(e) => setFormData({ ...formData, lyricist: e.target.value })}
              className={formErrors.lyricist ? 'input-error' : ''}
            />
            {formErrors.lyricist && <span className="error-text">{formErrors.lyricist}</span>}
          </div>
          <div className="form-group">
            <label>作曲</label>
            <input
              type="text"
              value={formData.composer}
              onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
              className={formErrors.composer ? 'input-error' : ''}
            />
            {formErrors.composer && <span className="error-text">{formErrors.composer}</span>}
          </div>
          <div className="form-group">
            <label>編曲（任意）</label>
            <input
              type="text"
              value={formData.arranger ?? ''}
              onChange={(e) => setFormData({ ...formData, arranger: e.target.value || null })}
              className={formErrors.arranger ? 'input-error' : ''}
            />
            {formErrors.arranger && <span className="error-text">{formErrors.arranger}</span>}
          </div>
          <div className="form-group">
            <label>歌詞（任意）</label>
            <textarea
              value={formData.lyrics ?? ''}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value || null })}
              rows={10}
              style={{ width: '100%', fontFamily: 'inherit' }}
              className={formErrors.lyrics ? 'input-error' : ''}
            />
            {formErrors.lyrics && <span className="error-text">{formErrors.lyrics}</span>}
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={closeModal}>
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? '保存中...' : (editingSong ? '更新' : '登録')}
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
