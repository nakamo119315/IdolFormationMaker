import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';

export function MemberEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const initializedRef = useRef(false);

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthplace, setBirthplace] = useState('');
  const [penLightColor1, setPenLightColor1] = useState('');
  const [penLightColor2, setPenLightColor2] = useState('');
  const [groupId, setGroupId] = useState('');
  const [generation, setGeneration] = useState('');
  const [isGraduated, setIsGraduated] = useState(false);
  const [nickname, setNickname] = useState('');
  const [callName, setCallName] = useState('');

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersApi.getById(id!),
    enabled: isEditing,
  });

  // Initialize form when member data is loaded (only once)
  useEffect(() => {
    if (member && !initializedRef.current) {
      initializedRef.current = true;
      setName(member.name);
      setBirthDate(member.birthDate);
      setBirthplace(member.birthplace ?? '');
      setPenLightColor1(member.penLightColor1 ?? '');
      setPenLightColor2(member.penLightColor2 ?? '');
      setGroupId(member.groupId ?? '');
      setGeneration(member.generation?.toString() ?? '');
      setIsGraduated(member.isGraduated);
      setNickname(member.nickname ?? '');
      setCallName(member.callName ?? '');
    }
  }, [member]);

  const createMutation = useMutation({
    mutationFn: membersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      navigate('/members');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof membersApi.update>[1] }) =>
      membersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] });
      navigate(`/members/${variables.id}`);
    },
  });

  // Get the selected group to check if it has generations
  const selectedGroup = groups?.find(g => g.id === groupId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;

    const data = {
      name,
      birthDate,
      birthplace: birthplace || null,
      penLightColor1: penLightColor1 || null,
      penLightColor2: penLightColor2 || null,
      groupId: groupId || null,
      generation: generation ? parseInt(generation) : null,
      isGraduated,
      nickname: nickname || null,
      callName: callName || null,
    };

    if (isEditing) {
      updateMutation.mutate({ id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (groupsLoading || (isEditing && memberLoading)) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen gradient-bg pt-20 sm:pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <button
            onClick={() => navigate(isEditing ? `/members/${id}` : '/members')}
            className="flex items-center text-primary-600 hover:text-primary-500 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-800">
            {isEditing ? 'メンバー編集' : '新規メンバー'}
          </h1>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-6"
        >
          {/* 基本情報 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary-800">基本情報</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                名前 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                placeholder="例: 山田太郎"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                生年月日 *
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                出身地
              </label>
              <input
                type="text"
                value={birthplace}
                onChange={(e) => setBirthplace(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                placeholder="例: 東京都"
              />
            </div>
          </div>

          {/* ニックネーム・コール名 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary-800">ニックネーム・コール名</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ニックネーム（あだ名）
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                placeholder="例: たろちゃん"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                コール名
              </label>
              <input
                type="text"
                value={callName}
                onChange={(e) => setCallName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                placeholder="例: たろー"
              />
            </div>
          </div>

          {/* グループ情報 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary-800">グループ情報</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                所属グループ
              </label>
              <select
                value={groupId}
                onChange={(e) => {
                  setGroupId(e.target.value);
                  if (!e.target.value) {
                    setGeneration('');
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
              >
                <option value="">グループを選択</option>
                {groups?.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedGroup?.hasGeneration && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  期
                </label>
                <input
                  type="number"
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  placeholder="例: 1"
                  min="1"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isGraduated"
                checked={isGraduated}
                onChange={(e) => setIsGraduated(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="isGraduated" className="text-sm font-medium text-slate-700">
                卒業済み
              </label>
            </div>
          </div>

          {/* ペンライトカラー */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary-800">ペンライトカラー</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  カラー1
                </label>
                <input
                  type="text"
                  value={penLightColor1}
                  onChange={(e) => setPenLightColor1(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  placeholder="例: 赤"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  カラー2
                </label>
                <input
                  type="text"
                  value={penLightColor2}
                  onChange={(e) => setPenLightColor2(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  placeholder="例: 白"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate(isEditing ? `/members/${id}` : '/members')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!name || !birthDate || createMutation.isPending || updateMutation.isPending}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30"
            >
              {createMutation.isPending || updateMutation.isPending
                ? '保存中...'
                : isEditing
                ? '更新'
                : '作成'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
