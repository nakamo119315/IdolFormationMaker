import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formationsApi } from '../api/formations';
import { groupsApi } from '../api/groups';
import { membersApi } from '../api/members';
import { Loading } from '../components/common/Loading';
import { FormationEditor } from '../components/formations/FormationEditor';
import type { CreateFormationPositionDto } from '../types';

export function FormationCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const initializedRef = useRef(false);

  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [positions, setPositions] = useState<CreateFormationPositionDto[]>([]);

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  const { data: formation, isLoading: formationLoading } = useQuery({
    queryKey: ['formation', id],
    queryFn: () => formationsApi.getById(id!),
    enabled: isEditing,
  });

  // Initialize form when formation data is loaded (only once)
  // This is a valid pattern for form initialization from async data
  useEffect(() => {
    if (formation && !initializedRef.current) {
      initializedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Form initialization from loaded data
      setName(formation.name);
      setGroupId(formation.groupId);
      setPositions(
        formation.positions.map((p) => ({
          memberId: p.memberId,
          positionNumber: p.positionNumber,
          row: p.row,
          column: p.column,
        }))
      );
    }
  }, [formation]);

  const createMutation = useMutation({
    mutationFn: formationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      navigate('/formations');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formationsApi.update extends (id: string, data: infer D) => unknown ? D : never }) =>
      formationsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      queryClient.invalidateQueries({ queryKey: ['formation', variables.id] });
      navigate('/formations');
    },
  });

  const filteredMembers = members?.filter((m) => m.groupId === groupId) ?? [];

  const handleSubmit = () => {
    if (!name || !groupId || positions.length === 0) return;

    const data = {
      name,
      groupId,
      positions: positions.map(({ memberId, positionNumber, row, column }) => ({
        memberId,
        positionNumber,
        row,
        column,
      })),
    };

    if (isEditing) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (groupsLoading || membersLoading || (isEditing && formationLoading)) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 sm:pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <button
            onClick={() => navigate('/formations')}
            className="flex items-center text-slate-600 hover:text-primary-500 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">
            {isEditing ? 'フォーメーション編集' : '新規フォーメーション'}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">基本情報</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                フォーメーション名 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                placeholder="例: おいでシャンプー"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                グループ *
              </label>
              <select
                value={groupId}
                onChange={(e) => {
                  setGroupId(e.target.value);
                  setPositions([]);
                }}
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

          {/* Position Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4">ポジション配置</h2>
            <p className="text-sm text-slate-500 mb-4">
              メンバーをドラッグしてステージに配置してください。配置順に自動でポジション番号が振られます。
            </p>
            <FormationEditor
              members={filteredMembers}
              allMembers={members ?? []}
              positions={positions}
              onChange={setPositions}
            />
          </motion.div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/formations')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name || !groupId || positions.length === 0}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30"
            >
              {isEditing ? '更新' : '作成'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
