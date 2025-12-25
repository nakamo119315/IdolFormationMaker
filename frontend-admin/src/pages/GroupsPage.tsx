import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../api/groups';
import { Modal } from '../components/common/Modal';
import type { GroupSummary, CreateGroupDto, UpdateGroupDto } from '../types';

export function GroupsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupSummary | null>(null);
  const [formData, setFormData] = useState<CreateGroupDto>({
    name: '',
    debutDate: null,
    hasGeneration: false,
  });

  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupDto }) =>
      groupsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: groupsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const openCreateModal = () => {
    setEditingGroup(null);
    setFormData({ name: '', debutDate: null, hasGeneration: false });
    setIsModalOpen(true);
  };

  const openEditModal = (group: GroupSummary) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      debutDate: group.debutDate,
      hasGeneration: group.hasGeneration,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('削除してもよろしいですか？')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>グループ管理</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>
          新規登録
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>名前</th>
            <th>デビュー日</th>
            <th>メンバー数</th>
            <th>期別管理</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {groups?.map((group) => (
            <tr key={group.id}>
              <td>{group.name}</td>
              <td>{group.debutDate ?? '-'}</td>
              <td>{group.memberCount}</td>
              <td>{group.hasGeneration ? 'あり' : '-'}</td>
              <td>
                <button
                  className="btn btn-sm"
                  onClick={() => openEditModal(group)}
                >
                  編集
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(group.id)}
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
        title={editingGroup ? 'グループ編集' : 'グループ登録'}
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
            <label>デビュー日</label>
            <input
              type="date"
              value={formData.debutDate ?? ''}
              onChange={(e) => setFormData({ ...formData, debutDate: e.target.value || null })}
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.hasGeneration ?? false}
                onChange={(e) => setFormData({ ...formData, hasGeneration: e.target.checked })}
              />
              期別管理あり（乃木坂46等）
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={closeModal}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              {editingGroup ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
