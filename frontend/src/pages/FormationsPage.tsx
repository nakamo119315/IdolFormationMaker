import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formationsApi } from '../api/formations';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Modal } from '../components/common/Modal';
import type { Formation, CreateFormationDto, UpdateFormationDto, CreateFormationPositionDto, Member } from '../types';

export function FormationsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const [viewingFormation, setViewingFormation] = useState<Formation | null>(null);
  const [formData, setFormData] = useState<CreateFormationDto>({
    name: '',
    groupId: '',
    positions: [],
  });

  const { data: formations, isLoading } = useQuery({
    queryKey: ['formations'],
    queryFn: formationsApi.getAll,
  });

  const { data: members } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: formationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFormationDto }) =>
      formationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: formationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
    },
  });

  const openCreateModal = () => {
    setEditingFormation(null);
    setFormData({ name: '', groupId: '', positions: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (formation: Formation) => {
    setEditingFormation(formation);
    setFormData({
      name: formation.name,
      groupId: formation.groupId,
      positions: formation.positions.map(p => ({
        memberId: p.memberId,
        positionNumber: p.positionNumber,
        row: p.row,
        column: p.column,
      })),
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (formation: Formation) => {
    setViewingFormation(formation);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFormation(null);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewingFormation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFormation) {
      updateMutation.mutate({ id: editingFormation.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('削除してもよろしいですか？')) {
      deleteMutation.mutate(id);
    }
  };

  const addPosition = () => {
    const nextNumber = formData.positions.length + 1;
    setFormData({
      ...formData,
      positions: [...formData.positions, { memberId: '', positionNumber: nextNumber, row: 1, column: nextNumber }],
    });
  };

  const updatePosition = (index: number, field: keyof CreateFormationPositionDto, value: string | number) => {
    const newPositions = [...formData.positions];
    newPositions[index] = { ...newPositions[index], [field]: value };
    setFormData({ ...formData, positions: newPositions });
  };

  const removePosition = (index: number) => {
    setFormData({
      ...formData,
      positions: formData.positions.filter((_, i) => i !== index),
    });
  };

  // フォーメーションを列ごとにグループ化
  const getFormationRows = (formation: Formation) => {
    const rowMap = new Map<number, typeof formation.positions>();
    formation.positions.forEach(pos => {
      const existing = rowMap.get(pos.row) || [];
      existing.push(pos);
      rowMap.set(pos.row, existing);
    });

    // 各列をcolumnでソート
    const sortedRows = Array.from(rowMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([row, positions]) => ({
        row,
        positions: positions.sort((a, b) => a.column - b.column),
      }));

    return sortedRows;
  };

  // メンバー情報を取得
  const getMemberInfo = (memberId: string): Member | undefined => {
    return members?.find(m => m.id === memberId);
  };

  // メンバーのプライマリ画像を取得
  const getMemberImage = (member: Member | undefined): string | null => {
    if (!member) return null;
    const primaryImage = member.images.find(img => img.isPrimary) ?? member.images[0];
    return primaryImage?.url ?? null;
  };

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>フォーメーション管理</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>
          新規登録
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>名前</th>
            <th>グループ</th>
            <th>ポジション数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {formations?.map((formation) => (
            <tr key={formation.id}>
              <td>{formation.name}</td>
              <td>{groups?.find(g => g.id === formation.groupId)?.name ?? '-'}</td>
              <td>{formation.positions.length}</td>
              <td>
                <button
                  className="btn btn-sm"
                  onClick={() => openDetailModal(formation)}
                >
                  詳細
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => openEditModal(formation)}
                >
                  編集
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(formation.id)}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 詳細モーダル（フォーメーション図） */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        title={viewingFormation ? `${viewingFormation.name} - フォーメーション` : 'フォーメーション詳細'}
      >
        {viewingFormation && (
          <div className="formation-detail">
            <div className="formation-info">
              <p><strong>グループ:</strong> {groups?.find(g => g.id === viewingFormation.groupId)?.name ?? '-'}</p>
              <p><strong>ポジション数:</strong> {viewingFormation.positions.length}人</p>
            </div>
            <div className="formation-stage">
              <div className="stage-label">ステージ前方</div>
              <div className="formation-grid">
                {getFormationRows(viewingFormation).map(({ row, positions }) => (
                  <div key={row} className="formation-row">
                    {positions.map((pos) => {
                      const member = getMemberInfo(pos.memberId);
                      const imageUrl = getMemberImage(member);
                      return (
                        <div key={pos.id} className="formation-position">
                          <div className="position-number">{pos.positionNumber}</div>
                          {imageUrl ? (
                            <img src={imageUrl} alt={member?.name} className="position-image" />
                          ) : (
                            <div className="position-image-placeholder">
                              {member?.name?.charAt(0) ?? '?'}
                            </div>
                          )}
                          <div className="position-name">{member?.name ?? '未設定'}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="stage-label">ステージ後方</div>
            </div>
          </div>
        )}
      </Modal>

      {/* 編集モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingFormation ? 'フォーメーション編集' : 'フォーメーション登録'}
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

          <div className="form-group">
            <label>ポジション</label>
            <button type="button" className="btn btn-sm" onClick={addPosition}>
              + ポジション追加
            </button>
          </div>

          {formData.positions.map((position, index) => (
            <div key={index} className="position-row">
              <div className="position-fields">
                <div className="form-group">
                  <label>番号</label>
                  <input
                    type="number"
                    min="1"
                    value={position.positionNumber}
                    onChange={(e) => updatePosition(index, 'positionNumber', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>列</label>
                  <input
                    type="number"
                    min="1"
                    value={position.row}
                    onChange={(e) => updatePosition(index, 'row', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>メンバー</label>
                  <select
                    value={position.memberId}
                    onChange={(e) => updatePosition(index, 'memberId', e.target.value)}
                    required
                  >
                    <option value="">選択してください</option>
                    {members?.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removePosition(index)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}

          <div className="form-actions">
            <button type="button" className="btn" onClick={closeModal}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary">
              {editingFormation ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
