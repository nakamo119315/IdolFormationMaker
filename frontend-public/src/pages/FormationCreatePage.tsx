import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formationsApi } from '../api/formations';
import { groupsApi } from '../api/groups';
import { membersApi } from '../api/members';
import { Loading } from '../components/common/Loading';
import type { CreateFormationPositionDto, Member } from '../types';

interface PositionData extends CreateFormationPositionDto {
  tempId: string;
}

export function FormationCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

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

  useEffect(() => {
    if (formation) {
      setName(formation.name);
      setGroupId(formation.groupId);
      setPositions(
        formation.positions.map((p, i) => ({
          tempId: `pos-${i}`,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      navigate('/formations');
    },
  });

  const filteredMembers = members?.filter((m) => m.groupId === groupId) ?? [];

  const addPosition = () => {
    if (!selectedMemberId) return;
    const nextPositionNumber = positions.length + 1;
    const row = Math.ceil(nextPositionNumber / 5);
    const column = ((nextPositionNumber - 1) % 5) + 1;

    setPositions([
      ...positions,
      {
        tempId: `pos-${Date.now()}`,
        memberId: selectedMemberId,
        positionNumber: nextPositionNumber,
        row,
        column,
      },
    ]);
    setSelectedMemberId('');
  };

  const removePosition = (tempId: string) => {
    const newPositions = positions
      .filter((p) => p.tempId !== tempId)
      .map((p, i) => ({ ...p, positionNumber: i + 1 }));
    setPositions(newPositions);
  };

  const getMemberById = (memberId: string): Member | undefined => {
    return members?.find((m) => m.id === memberId);
  };

  const getPrimaryImage = (member: Member) => {
    return member.images.find((img) => img.isPrimary) ?? member.images[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
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
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            {isEditing ? 'フォーメーション編集' : '新規フォーメーション'}
          </h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* 基本情報 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">基本情報</h2>

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

          {/* ポジション設定 */}
          {groupId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
            >
              <h2 className="text-xl font-semibold text-slate-800">ポジション設定</h2>

              {/* メンバー追加 */}
              <div className="flex gap-3">
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                >
                  <option value="">メンバーを選択</option>
                  {filteredMembers
                    .filter((m) => !positions.some((p) => p.memberId === m.id))
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={addPosition}
                  disabled={!selectedMemberId}
                  className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  追加
                </button>
              </div>

              {/* ポジション一覧 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {positions.map((pos) => {
                  const member = getMemberById(pos.memberId);
                  if (!member) return null;
                  const image = getPrimaryImage(member);

                  return (
                    <motion.div
                      key={pos.tempId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative bg-slate-50 rounded-xl p-3 text-center"
                    >
                      <button
                        type="button"
                        onClick={() => removePosition(pos.tempId)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                      <div className="absolute -top-1 -left-1 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {pos.positionNumber}
                      </div>
                      {image ? (
                        <img
                          src={image.url}
                          alt={member.name}
                          className="w-16 h-16 mx-auto rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <p className="mt-2 text-sm font-medium text-slate-700 truncate">
                        {member.name}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              {positions.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  メンバーを追加してください
                </div>
              )}
            </motion.div>
          )}

          {/* 送信ボタン */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/formations')}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!name || !groupId || positions.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30"
            >
              {isEditing ? '更新' : '作成'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
