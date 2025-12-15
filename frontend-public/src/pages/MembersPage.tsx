import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { MemberCard } from '../components/members/MemberCard';
import { Loading } from '../components/common/Loading';

export function MembersPage() {
  const { data: members, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Members
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            輝くアイドルたちをご紹介
          </p>
        </motion.div>

        {/* メンバーグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members?.map((member, index) => (
            <MemberCard key={member.id} member={member} index={index} />
          ))}
        </div>

        {members?.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            メンバーが登録されていません
          </div>
        )}
      </div>
    </div>
  );
}
