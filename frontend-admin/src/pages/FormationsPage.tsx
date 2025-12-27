import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formationsApi } from '../api/formations';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Modal } from '../components/common/Modal';
import { Loading } from '../components/common/Loading';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast, type ToastMessage } from '../components/common/Toast';
import { FormationEditor } from '../components/formations/FormationEditor';
import type { Formation, CreateFormationDto, UpdateFormationDto, Member } from '../types';

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

  // 削除確認ダイアログ
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // トースト
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const { data: formations, isLoading, error } = useQuery({
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
      addToast('success', 'フォーメーションを登録しました');
    },
    onError: () => {
      addToast('error', 'フォーメーションの登録に失敗しました');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFormationDto }) =>
      formationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      closeModal();
      addToast('success', 'フォーメーションを更新しました');
    },
    onError: () => {
      addToast('error', 'フォーメーションの更新に失敗しました');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: formationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      setDeleteTarget(null);
      addToast('success', 'フォーメーションを削除しました');
    },
    onError: () => {
      addToast('error', 'フォーメーションの削除に失敗しました');
    },
  });

  const openCreateModal = () => {
    setEditingFormation(null);
    setFormData({ name: '', groupId: '', positions: [] });
    setIsModalOpen(true);
  };

  const openEditModal = (formation: Formation) => {
    setEditingFormation(formation);

    // 行ごとにグループ化して列を再計算
    const positionsByRow = new Map<number, typeof formation.positions>();
    formation.positions.forEach(p => {
      const existing = positionsByRow.get(p.row) || [];
      existing.push(p);
      positionsByRow.set(p.row, existing);
    });

    // 各行内でpositionNumber順にソートし、列を1から振り直す
    const recalculatedPositions = Array.from(positionsByRow.entries())
      .flatMap(([, rowPositions]) => {
        return rowPositions
          .sort((a, b) => a.positionNumber - b.positionNumber)
          .map((p, idx) => ({
            memberId: p.memberId,
            positionNumber: p.positionNumber,
            row: p.row,
            column: idx + 1,
          }));
      })
      .sort((a, b) => a.positionNumber - b.positionNumber);

    setFormData({
      name: formation.name,
      groupId: formation.groupId,
      positions: recalculatedPositions,
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

  const handleDelete = (formation: Formation) => {
    setDeleteTarget({ id: formation.id, name: formation.name });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  // フォーメーションを列ごとにグループ化
  const getFormationRows = (formation: Formation) => {
    const rowMap = new Map<number, typeof formation.positions>();
    formation.positions.forEach(pos => {
      const existing = rowMap.get(pos.row) || [];
      existing.push(pos);
      rowMap.set(pos.row, existing);
    });

    // 各列をpositionNumberでソート
    const sortedRows = Array.from(rowMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([row, positions]) => ({
        row,
        positions: positions.sort((a, b) => a.positionNumber - b.positionNumber),
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

  if (isLoading) return <Loading message="フォーメーションを読み込み中..." />;

  if (error) {
    return (
      <div className="page">
        <div className="error-message">
          <p>データの読み込みに失敗しました</p>
          <button className="btn btn-primary" onClick={() => queryClient.invalidateQueries({ queryKey: ['formations'] })}>
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
                  onClick={() => handleDelete(formation)}
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="フォーメーションの削除"
        message={`「${deleteTarget?.name}」を削除してもよろしいですか？`}
        confirmLabel="削除"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

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
                    <div className="row-label">{row}列目</div>
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

          {formData.groupId && members && (
            <div className="form-group">
              <label>ポジション配置（メンバーをグリッドにドラッグ＆ドロップ）</label>
              <FormationEditor
                members={members.filter(m => m.groupId === formData.groupId)}
                allMembers={members}
                positions={formData.positions}
                onChange={(positions) => setFormData({ ...formData, positions })}
              />
            </div>
          )}

          {!formData.groupId && (
            <div className="form-group">
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                グループを選択するとポジション配置ができます
              </p>
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
              {createMutation.isPending || updateMutation.isPending ? '保存中...' : (editingFormation ? '更新' : '登録')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
