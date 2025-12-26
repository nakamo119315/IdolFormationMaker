import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersApi.getById(id!),
    enabled: !!id,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  if (isLoading) return <Loading />;
  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">メンバーが見つかりません</p>
          <Link to="/members" className="text-rose-500 hover:underline">
            メンバー一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = member.images.find(img => img.isPrimary) ?? member.images[0];
  const group = groups?.find(g => g.id === member.groupId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 戻るリンク */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/members"
            className="inline-flex items-center text-slate-500 hover:text-primary-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            メンバー一覧に戻る
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* 画像セクション */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-8xl text-white/80">{member.name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* 画像ギャラリー */}
            {member.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {member.images.map((image) => (
                  <div
                    key={image.id}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer
                              ${image.isPrimary ? 'ring-2 ring-primary-500' : ''}`}
                  >
                    <img src={image.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* プロフィールセクション */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              {member.name}
            </h1>

            {group && (
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  to={`/groups/${group.id}`}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700"
                >
                  <span className="text-lg">{group.name}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                {member.generation && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {member.generation}期生
                  </span>
                )}
                {member.isGraduated && (
                  <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm font-medium">
                    卒業
                  </span>
                )}
              </div>
            )}

            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl shadow-lg">
                <h3 className="text-sm font-medium text-slate-500 tracking-wider mb-2">
                  生年月日
                </h3>
                <p className="text-2xl font-semibold text-slate-800">{member.birthDate}</p>
              </div>

              {member.birthplace && (
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <h3 className="text-sm font-medium text-slate-500 tracking-wider mb-2">
                    出身地
                  </h3>
                  <p className="text-2xl font-semibold text-slate-800">{member.birthplace}</p>
                </div>
              )}

              {member.penLightColor1 && (
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <h3 className="text-sm font-medium text-slate-500 tracking-wider mb-2">
                    ペンライトカラー
                  </h3>
                  <p className="text-2xl font-semibold text-slate-800">
                    {member.penLightColor1}
                    {member.penLightColor2 && member.penLightColor2 !== member.penLightColor1 && ` × ${member.penLightColor2}`}
                  </p>
                </div>
              )}

              <div className="p-6 bg-white rounded-2xl shadow-lg">
                <h3 className="text-sm font-medium text-slate-500 tracking-wider mb-2">
                  画像数
                </h3>
                <p className="text-2xl font-semibold text-slate-800">{member.images.length}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
