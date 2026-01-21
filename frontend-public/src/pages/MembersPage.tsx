import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
            Members
          </h1>
          <p className="text-primary-600/70 max-w-2xl mx-auto mb-6">
            輝くアイドルたちをご紹介
          </p>
          <Link
            to="/members/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規メンバー
          </Link>
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
            className="px-4 py-2 rounded-xl border border-primary-200 bg-white/80 backdrop-blur-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
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
              className="px-4 py-2 rounded-xl border border-primary-200 bg-white/80 backdrop-blur-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
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
          <span className="flex items-center text-primary-600 text-sm font-medium">
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
          <div className="text-center py-20 text-primary-600">
            該当するメンバーがいません
          </div>
        )}
      </div>
    </div>
  );
}
