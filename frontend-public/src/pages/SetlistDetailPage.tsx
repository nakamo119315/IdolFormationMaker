import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { setlistsApi } from '../api/setlists';
import { songsApi } from '../api/songs';
import { groupsApi } from '../api/groups';
import { membersApi } from '../api/members';
import { Loading } from '../components/common/Loading';

export function SetlistDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: setlist, isLoading: setlistLoading } = useQuery({
    queryKey: ['setlist', id],
    queryFn: () => setlistsApi.getById(id!),
    enabled: !!id,
  });

  const { data: songs } = useQuery({
    queryKey: ['songs'],
    queryFn: songsApi.getAll,
  });

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const { data: members } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  if (setlistLoading) return <Loading />;
  if (!setlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">セットリストが見つかりません</p>
          <Link to="/setlists" className="text-rose-500 hover:underline">
            セトリ一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const groupName = groups?.find((g) => g.id === setlist.groupId)?.name ?? '';
  const getSongTitle = (songId: string) => songs?.find((s) => s.id === songId)?.title ?? '不明';
  const getMemberName = (memberId: string | null) => {
    if (!memberId) return null;
    const member = members?.find((m) => m.id === memberId);
    if (!member) return null;
    // 姓名を短縮（姓のみ、または3文字まで）
    const name = member.name;
    return name.length > 3 ? name.slice(0, 3) : name;
  };

  const sortedItems = [...setlist.items].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* 戻るリンク */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-3 flex items-center justify-between"
        >
          <Link
            to="/setlists"
            className="inline-flex items-center text-sm text-slate-500 hover:text-rose-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </Link>
          <Link
            to={`/setlists/${id}/edit`}
            className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編集
          </Link>
        </motion.div>

        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-4 border border-slate-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-500 text-sm font-medium">{groupName}</p>
              <h1 className="text-xl font-bold text-slate-800">
                {setlist.name}
              </h1>
            </div>
            <div className="text-right">
              {setlist.eventDate && (
                <p className="text-sm text-slate-500">{setlist.eventDate}</p>
              )}
              <p className="text-sm text-slate-400">{setlist.items.length}曲</p>
            </div>
          </div>
        </motion.div>

        {/* セトリ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {sortedItems.map((item) => {
              const centerName = getMemberName(item.centerMemberId);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {item.order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-800 truncate block">
                      {getSongTitle(item.songId)}
                    </span>
                    {centerName && (
                      <span className="text-xs text-rose-500 truncate block">
                        C: {centerName}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {setlist.items.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            楽曲が登録されていません
          </div>
        )}
      </div>
    </div>
  );
}
