import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Modal } from '../components/common/Modal';
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
    groupId: null,
  });
  const [imageUrl, setImageUrl] = useState('');

  const { data: members, isLoading } = useQuery({
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
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberDto }) =>
      membersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: membersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const addImageMutation = useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: AddMemberImageDto }) =>
      membersApi.addImage(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setImageUrl('');
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ memberId, imageId }: { memberId: string; imageId: string }) =>
      membersApi.deleteImage(memberId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const openCreateModal = () => {
    setEditingMember(null);
    setFormData({ name: '', birthDate: '', groupId: null });
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      birthDate: member.birthDate,
      groupId: member.groupId,
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

  const handleDelete = (id: string) => {
    if (confirm('削除してもよろしいですか？')) {
      deleteMutation.mutate(id);
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
    if (confirm('この画像を削除しますか？')) {
      deleteImageMutation.mutate({ memberId, imageId });
    }
  };

  const getPrimaryImage = (member: Member) => {
    return member.images.find(img => img.isPrimary) ?? member.images[0];
  };

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <div className="page">
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
            <th>所属グループ</th>
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
                <td>
                  {groups?.find((g) => g.id === member.groupId)?.name ?? '-'}
                </td>
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
                    onClick={() => handleDelete(member.id)}
                  >
                    削除
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
              <p><strong>所属グループ:</strong> {groups?.find(g => g.id === viewingMember.groupId)?.name ?? '未所属'}</p>
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
                    disabled={!imageUrl.trim()}
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn" onClick={closeModal}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              {editingMember ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
