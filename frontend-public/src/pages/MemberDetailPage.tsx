import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';
import { ShareButton } from '../components/common/ShareButton';

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', id],
    queryFn: () => membersApi.getById(id!),
    enabled: !!id,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: () => membersApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      navigate('/members');
    },
  });

  if (isLoading) return <Loading />;
  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-600/70 mb-4">メンバーが見つかりません</p>
          <Link to="/members" className="text-primary-500 hover:underline">
            メンバー一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = member.images.find(img => img.isPrimary) ?? member.images[0];
  const group = groups?.find(g => g.id === member.groupId);

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 戻るリンク */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            to="/members"
            className="inline-flex items-center text-primary-600/70 hover:text-primary-600 transition-colors"
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
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-primary-700">
                {member.name}
              </h1>
              <div className="flex items-center gap-2">
                <Link
                  to={`/members/${id}/edit`}
                  className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors"
                  title="編集"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="削除"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <ShareButton
                  title={`${member.name} | Idol Management`}
                  text={`${member.name}のプロフィールをチェック！`}
                />
              </div>
            </div>

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
                  <span className="px-3 py-1 bg-slate-200 text-primary-600 rounded-full text-sm font-medium">
                    卒業
                  </span>
                )}
              </div>
            )}

            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl shadow-lg">
                <h3 className="text-sm font-medium text-primary-600/70 tracking-wider mb-2">
                  生年月日
                </h3>
                <p className="text-2xl font-semibold text-slate-800">{member.birthDate}</p>
              </div>

              {member.birthplace && (
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <h3 className="text-sm font-medium text-primary-600/70 tracking-wider mb-2">
                    出身地
                  </h3>
                  <p className="text-2xl font-semibold text-slate-800">{member.birthplace}</p>
                </div>
              )}

              {member.penLightColor1 && (
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <h3 className="text-sm font-medium text-primary-600/70 tracking-wider mb-2">
                    ペンライトカラー
                  </h3>
                  <p className="text-2xl font-semibold text-slate-800">
                    {member.penLightColor1}
                    {member.penLightColor2 && member.penLightColor2 !== member.penLightColor1 && ` × ${member.penLightColor2}`}
                  </p>
                </div>
              )}

              {member.nickname && (
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <h3 className="text-sm font-medium text-primary-600/70 tracking-wider mb-2">
                    ニックネーム
                  </h3>
                  <p className="text-2xl font-semibold text-slate-800">{member.nickname}</p>
                </div>
              )}

              {member.callName && (
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <h3 className="text-sm font-medium text-primary-600/70 tracking-wider mb-2">
                    コール名
                  </h3>
                  <p className="text-2xl font-semibold text-slate-800">{member.callName}</p>
                </div>
              )}

              <div className="p-6 bg-white rounded-2xl shadow-lg">
                <h3 className="text-sm font-medium text-primary-600/70 tracking-wider mb-2">
                  画像数
                </h3>
                <p className="text-2xl font-semibold text-slate-800">{member.images.length}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">メンバーを削除</h3>
            <p className="text-slate-600 mb-6">
              「{member.name}」を削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? '削除中...' : '削除'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
