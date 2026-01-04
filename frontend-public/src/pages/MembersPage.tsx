import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { MemberCard } from '../components/members/MemberCard';
import { Loading } from '../components/common/Loading';

export function MembersPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGeneration, setSelectedGeneration] = useState<string>('');

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  // Get the selected group to check if it has generations
  const selectedGroup = useMemo(() => {
    return groups?.find(g => g.id === selectedGroupId);
  }, [groups, selectedGroupId]);

  // Get available generations for the selected group
  const availableGenerations = useMemo(() => {
    if (!members || !selectedGroupId) return [];
    const generations = new Set<number>();
    members
      .filter(m => m.groupId === selectedGroupId && m.generation !== null)
      .forEach(m => generations.add(m.generation!));
    return Array.from(generations).sort((a, b) => a - b);
  }, [members, selectedGroupId]);

  // Filter members
  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter(member => {
      if (selectedGroupId && member.groupId !== selectedGroupId) return false;
      if (selectedGeneration && member.generation !== parseInt(selectedGeneration)) return false;
      return true;
    });
  }, [members, selectedGroupId, selectedGeneration]);

  if (membersLoading || groupsLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary-800 mb-4">
            Members
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            輝くアイドルたちをご紹介
          </p>
        </motion.div>

        {/* フィルター */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          {/* グループフィルター */}
          <select
            value={selectedGroupId}
            onChange={(e) => {
              setSelectedGroupId(e.target.value);
              setSelectedGeneration(''); // Reset generation when group changes
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
          >
            <option value="">すべてのグループ</option>
            {groups?.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>

          {/* 期別フィルター（グループが選択されていて、期がある場合のみ表示） */}
          {selectedGroup?.hasGeneration && availableGenerations.length > 0 && (
            <select
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
            >
              <option value="">すべての期</option>
              {availableGenerations.map((gen) => (
                <option key={gen} value={gen}>
                  {gen}期生
                </option>
              ))}
            </select>
          )}

          {/* フィルター結果の表示 */}
          <span className="flex items-center text-slate-500 text-sm">
            {filteredMembers.length}人のメンバー
          </span>
        </motion.div>

        {/* メンバーグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMembers.map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} />
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            該当するメンバーがいません
          </div>
        )}
      </div>
    </div>
  );
}
