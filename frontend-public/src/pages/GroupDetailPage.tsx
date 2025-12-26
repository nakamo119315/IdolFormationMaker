import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '../api/groups';
import { membersApi } from '../api/members';
import { MemberCard } from '../components/members/MemberCard';
import { Loading } from '../components/common/Loading';

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedGeneration, setSelectedGeneration] = useState<string>('');

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.getById(id!),
    enabled: !!id,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  // Get all members of this group
  const groupMembers = useMemo(() => {
    return members?.filter(m => m.groupId === group?.id) ?? [];
  }, [members, group?.id]);

  // Get available generations
  const availableGenerations = useMemo(() => {
    const generations = new Set<number>();
    groupMembers
      .filter(m => m.generation !== null)
      .forEach(m => generations.add(m.generation!));
    return Array.from(generations).sort((a, b) => a - b);
  }, [groupMembers]);

  // Filter members by generation
  const filteredMembers = useMemo(() => {
    if (!selectedGeneration) return groupMembers;
    return groupMembers.filter(m => m.generation === parseInt(selectedGeneration));
  }, [groupMembers, selectedGeneration]);

  if (groupLoading || membersLoading) return <Loading />;
  if (!group) return <div className="pt-24 text-center">グループが見つかりません</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 戻るリンク */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/groups"
            className="inline-flex items-center text-slate-500 hover:text-primary-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            グループ一覧に戻る
          </Link>
        </motion.div>

        {/* グループヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            {group.name}
          </h1>
          <p className="text-slate-500">
            {groupMembers.length}人
          </p>
        </motion.div>

        {/* 期別フィルター */}
        {group.hasGeneration && availableGenerations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-4 justify-center mb-8"
          >
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
            <span className="flex items-center text-slate-500 text-sm">
              {filteredMembers.length}人のメンバー
            </span>
          </motion.div>
        )}

        {/* メンバー一覧 */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMembers.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            {selectedGeneration ? '該当するメンバーがいません' : 'このグループにはまだメンバーがいません'}
          </div>
        )}
      </div>
    </div>
  );
}
