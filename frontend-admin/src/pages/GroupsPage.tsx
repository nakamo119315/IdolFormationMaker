import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '../api/groups';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Toast, type ToastMessage } from '../components/common/Toast';
import { Pagination } from '../components/common/Pagination';
import { SearchForm } from '../components/common/SearchForm';
import { SkeletonTable } from '../components/common/Skeleton';
import { createGroupSchema } from '../validation/schemas';
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ページング・検索
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 20;

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

  const { data: pagedData, isLoading, error } = useQuery({
    queryKey: ['groups', 'paged', page, pageSize, search],
    queryFn: () => groupsApi.getPaged({ page, pageSize, search }),
  });

  const groups = pagedData?.items;

  const createMutation = useMutation({
    mutationFn: groupsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      closeModal();
      addToast('success', 'グループを登録しました');
    },
    onError: () => {
      addToast('error', 'グループの登録に失敗しました');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupDto }) =>
      groupsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      closeModal();
      addToast('success', 'グループ情報を更新しました');
    },
    onError: () => {
      addToast('error', 'グループ情報の更新に失敗しました');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: groupsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setDeleteTarget(null);
      addToast('success', 'グループを削除しました');
    },
    onError: () => {
      addToast('error', 'グループの削除に失敗しました');
    },
  });

  const openCreateModal = () => {
    setEditingGroup(null);
    setFormData({ name: '', debutDate: null, hasGeneration: false });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (group: GroupSummary) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      debutDate: group.debutDate,
      hasGeneration: group.hasGeneration,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = createGroupSchema.safeParse(formData);
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
    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (group: GroupSummary) => {
    setDeleteTarget({ id: group.id, name: group.name });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  if (error) {
    return (
      <div className="page">
        <div className="error-message">
          <p>データの読み込みに失敗しました</p>
          <button className="btn btn-primary" onClick={() => queryClient.invalidateQueries({ queryKey: ['groups'] })}>
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

  return (
    <div className="page">
      <Toast toasts={toasts} onRemove={removeToast} />

      <div className="page-header">
        <h1>グループ管理</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>
          新規登録
        </button>
      </div>

      <div className="filter-section">
        <SearchForm
          initialValue={search}
          onSearch={handleSearch}
          placeholder="グループ名で検索..."
        />
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
        {isLoading ? (
          <SkeletonTable rows={10} columns={5} />
        ) : (
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
                    onClick={() => handleDelete(group)}
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
        title="グループの削除"
        message={`「${deleteTarget?.name}」を削除してもよろしいですか？所属メンバーのグループ情報も解除されます。`}
        confirmLabel="削除"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
        variant="danger"
      />

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
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <span className="error-text">{formErrors.name}</span>}
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? '保存中...' : (editingGroup ? '更新' : '登録')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
