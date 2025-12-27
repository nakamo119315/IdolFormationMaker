import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Modal } from '../components/common/Modal';
import { Loading } from '../components/common/Loading';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast, type ToastMessage } from '../components/common/Toast';
import type { Member, CreateMemberDto, UpdateMemberDto, AddMemberImageDto } from '../types';

export function MembersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<CreateMemberDto>({
    name: '',
    birthDate: '',
    birthplace: null,
    penLightColor1: null,
    penLightColor2: null,
    groupId: null,
    generation: null,
    isGraduated: false,
  });
  const [imageUrl, setImageUrl] = useState('');

  // 削除確認ダイアログ
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [imageDeleteTarget, setImageDeleteTarget] = useState<{ memberId: string; imageId: string } | null>(null);

  // トースト
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const { data: members, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: membersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      closeModal();
      addToast('success', 'メンバーを登録しました');
    },
    onError: () => {
      addToast('error', 'メンバーの登録に失敗しました');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberDto }) =>
      membersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      closeModal();
      addToast('success', 'メンバー情報を更新しました');
    },
    onError: () => {
      addToast('error', 'メンバー情報の更新に失敗しました');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: membersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setDeleteTarget(null);
      addToast('success', 'メンバーを削除しました');
    },
    onError: () => {
      addToast('error', 'メンバーの削除に失敗しました');
    },
  });

  const addImageMutation = useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: AddMemberImageDto }) =>
      membersApi.addImage(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setImageUrl('');
      addToast('success', '画像を追加しました');
    },
    onError: () => {
      addToast('error', '画像の追加に失敗しました');
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ memberId, imageId }: { memberId: string; imageId: string }) =>
      membersApi.deleteImage(memberId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setImageDeleteTarget(null);
      addToast('success', '画像を削除しました');
    },
    onError: () => {
      addToast('error', '画像の削除に失敗しました');
    },
  });

  const openCreateModal = () => {
    setEditingMember(null);
    setFormData({ name: '', birthDate: '', birthplace: null, penLightColor1: null, penLightColor2: null, groupId: null, generation: null, isGraduated: false });
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      birthDate: member.birthDate,
      birthplace: member.birthplace,
      penLightColor1: member.penLightColor1,
      penLightColor2: member.penLightColor2,
      groupId: member.groupId,
      generation: member.generation,
      isGraduated: member.isGraduated,
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (member: Member) => {
    setViewingMember(member);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
    setImageUrl('');
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewingMember(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (member: Member) => {
    setDeleteTarget({ id: member.id, name: member.name });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const handleAddImage = (memberId: string) => {
    if (!imageUrl.trim()) return;
    const isPrimary = editingMember?.images.length === 0;
    addImageMutation.mutate({
      memberId,
      data: { url: imageUrl.trim(), isPrimary },
    });
  };

  const handleDeleteImage = (memberId: string, imageId: string) => {
    setImageDeleteTarget({ memberId, imageId });
  };

  const confirmDeleteImage = () => {
    if (imageDeleteTarget) {
      deleteImageMutation.mutate(imageDeleteTarget);
    }
  };

  const getPrimaryImage = (member: Member) => {
    return member.images.find(img => img.isPrimary) ?? member.images[0];
  };

  if (isLoading) return <Loading message="メンバーを読み込み中..." />;

  if (error) {
    return (
      <div className="page">
        <div className="error-message">
          <p>データの読み込みに失敗しました</p>
          <button className="btn btn-primary" onClick={() => queryClient.invalidateQueries({ queryKey: ['members'] })}>
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="page-header">
        <h1>メンバー管理</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>
          新規登録
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>画像</th>
            <th>名前</th>
            <th>生年月日</th>
            <th>出身地</th>
            <th>サイリウム</th>
            <th>所属グループ</th>
            <th>期別</th>
            <th>状態</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {members?.map((member) => {
            const primaryImage = getPrimaryImage(member);
            return (
              <tr key={member.id}>
                <td>
                  {primaryImage ? (
                    <img
                      src={primaryImage.url}
                      alt={member.name}
                      className="member-thumbnail"
                      onClick={() => openDetailModal(member)}
                    />
                  ) : (
                    <div className="member-thumbnail-placeholder" onClick={() => openDetailModal(member)}>
                      No Image
                    </div>
                  )}
                </td>
                <td>{member.name}</td>
                <td>{member.birthDate}</td>
                <td>{member.birthplace ?? '-'}</td>
                <td>
                  {member.penLightColor1 && member.penLightColor2
                    ? `${member.penLightColor1}×${member.penLightColor2}`
                    : '-'}
                </td>
                <td>
                  {groups?.find((g) => g.id === member.groupId)?.name ?? '-'}
                </td>
                <td>{member.generation ? `${member.generation}期` : '-'}</td>
                <td>{member.isGraduated ? '卒業' : '現役'}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => openDetailModal(member)}
                  >
                    詳細
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => openEditModal(member)}
                  >
                    編集
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(member)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="メンバーの削除"
        message={`「${deleteTarget?.name}」を削除してもよろしいですか？この操作は取り消せません。`}
        confirmLabel="削除"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

      {/* 画像削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={imageDeleteTarget !== null}
        title="画像の削除"
        message="この画像を削除してもよろしいですか？"
        confirmLabel="削除"
        onConfirm={confirmDeleteImage}
        onCancel={() => setImageDeleteTarget(null)}
        isLoading={deleteImageMutation.isPending}
        variant="danger"
      />

      {/* 詳細モーダル */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title="メンバー詳細"
      >
        {viewingMember && (
          <div className="member-detail">
            <div className="member-info">
              <p><strong>名前:</strong> {viewingMember.name}</p>
              <p><strong>生年月日:</strong> {viewingMember.birthDate}</p>
              <p><strong>出身地:</strong> {viewingMember.birthplace ?? '未設定'}</p>
              <p><strong>サイリウムカラー:</strong> {viewingMember.penLightColor1 && viewingMember.penLightColor2 ? `${viewingMember.penLightColor1}×${viewingMember.penLightColor2}` : '未設定'}</p>
              <p><strong>所属グループ:</strong> {groups?.find(g => g.id === viewingMember.groupId)?.name ?? '未所属'}</p>
              <p><strong>期別:</strong> {viewingMember.generation ? `${viewingMember.generation}期` : '未設定'}</p>
              <p><strong>状態:</strong> {viewingMember.isGraduated ? '卒業' : '現役'}</p>
            </div>
            <div className="member-images">
              <h4>画像一覧 ({viewingMember.images.length}枚)</h4>
              {viewingMember.images.length > 0 ? (
                <div className="image-grid">
                  {viewingMember.images.map((image) => (
                    <div key={image.id} className="image-item">
                      <img src={image.url} alt={viewingMember.name} />
                      {image.isPrimary && <span className="primary-badge">メイン</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-images">画像がありません</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingMember ? 'メンバー編集' : 'メンバー登録'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>名前</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>生年月日</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>出身地</label>
            <input
              type="text"
              value={formData.birthplace ?? ''}
              onChange={(e) => setFormData({ ...formData, birthplace: e.target.value || null })}
              placeholder="例: 東京都"
            />
          </div>
          <div className="form-group">
            <label>サイリウムカラー1</label>
            <input
              type="text"
              value={formData.penLightColor1 ?? ''}
              onChange={(e) => setFormData({ ...formData, penLightColor1: e.target.value || null })}
              placeholder="例: ピンク"
            />
          </div>
          <div className="form-group">
            <label>サイリウムカラー2</label>
            <input
              type="text"
              value={formData.penLightColor2 ?? ''}
              onChange={(e) => setFormData({ ...formData, penLightColor2: e.target.value || null })}
              placeholder="例: 白"
            />
          </div>
          <div className="form-group">
            <label>所属グループ</label>
            <select
              value={formData.groupId ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, groupId: e.target.value || null })
              }
            >
              <option value="">未所属</option>
              {groups?.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>期別</label>
            <input
              type="number"
              min="1"
              value={formData.generation ?? ''}
              onChange={(e) => setFormData({ ...formData, generation: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="例: 1"
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isGraduated ?? false}
                onChange={(e) => setFormData({ ...formData, isGraduated: e.target.checked })}
              />
              卒業済み
            </label>
          </div>

          {/* 画像管理（編集時のみ） */}
          {editingMember && (
            <div className="form-group">
              <label>画像管理</label>
              <div className="image-manager">
                {editingMember.images.map((image) => (
                  <div key={image.id} className="image-manager-item">
                    <img src={image.url} alt="" />
                    {image.isPrimary && <span className="primary-badge">メイン</span>}
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteImage(editingMember.id, image.id)}
                    >
                      削除
                    </button>
                  </div>
                ))}
                <div className="image-add-form">
                  <input
                    type="url"
                    placeholder="画像URLを入力"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => handleAddImage(editingMember.id)}
                    disabled={!imageUrl.trim() || addImageMutation.isPending}
                  >
                    {addImageMutation.isPending ? '追加中...' : '追加'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn" onClick={closeModal}>
              キャンセル
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? '保存中...' : (editingMember ? '更新' : '登録')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
