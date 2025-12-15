import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Modal } from '../components/common/Modal';
import type { Member, CreateMemberDto, UpdateMemberDto } from '../types';

export function MembersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState<CreateMemberDto>({
    name: '',
    birthDate: '',
    groupId: null,
  });

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

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
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
            <th>名前</th>
            <th>生年月日</th>
            <th>所属グループ</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {members?.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.birthDate}</td>
              <td>
                {groups?.find((g) => g.id === member.groupId)?.name ?? '-'}
              </td>
              <td>
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
          ))}
        </tbody>
      </table>

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
