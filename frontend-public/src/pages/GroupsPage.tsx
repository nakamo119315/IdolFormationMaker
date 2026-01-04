import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '../api/groups';
import { GroupCard } from '../components/groups/GroupCard';
import { Loading } from '../components/common/Loading';

export function GroupsPage() {
  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary-700 mb-4">
            Groups
          </h1>
          <p className="text-primary-600/70 max-w-2xl mx-auto">
            個性豊かなグループたち
          </p>
        </motion.div>

        {/* グループグリッド */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups?.map((group, index) => (
            <GroupCard key={group.id} group={group} index={index} />
          ))}
        </div>

        {groups?.length === 0 && (
          <div className="text-center py-20 text-primary-600/70">
            グループが登録されていません
          </div>
        )}
      </div>
    </div>
  );
}
