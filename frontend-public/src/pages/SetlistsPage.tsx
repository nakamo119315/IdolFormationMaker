import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { setlistsApi } from '../api/setlists';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';

export function SetlistsPage() {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const { data: setlists, isLoading } = useQuery({
    queryKey: ['setlists', selectedGroupId],
    queryFn: () => selectedGroupId ? setlistsApi.getByGroup(selectedGroupId) : setlistsApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: setlistsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setlists'] });
    },
  });

  const getGroupName = (groupId: string) => {
    return groups?.find((g) => g.id === groupId)?.name ?? '';
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('このセットリストを削除しますか？')) {
      deleteMutation.mutate(id);
    }
  };

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
            Setlists
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto mb-6">
            ユーザー作成のセットリスト
          </p>
          <Link
            to="/setlists/new"
            className="inline-flex items-center px-6 py-3 bg-rose-500 text-white rounded-full font-medium hover:bg-rose-600 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規作成
          </Link>
        </motion.div>

        {/* グループフィルター */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-8"
        >
          <button
            onClick={() => setSelectedGroupId('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedGroupId === ''
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            すべて
          </button>
          {groups?.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedGroupId === group.id
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {group.name}
            </button>
          ))}
        </motion.div>

        {/* セトリリスト */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {setlists?.map((setlist, index) => (
            <motion.div
              key={setlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <Link
                to={`/setlists/${setlist.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-slate-100 h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-rose-500 font-medium mb-1">
                      {getGroupName(setlist.groupId)}
                    </p>
                    <h3 className="text-lg font-bold text-slate-800">
                      {setlist.name}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => handleDelete(setlist.id, e)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{setlist.itemCount}曲</span>
                  {setlist.eventDate && (
                    <span>{setlist.eventDate}</span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {setlists?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-4">セットリストがありません</p>
            <Link
              to="/setlists/new"
              className="text-rose-500 hover:underline"
            >
              最初のセットリストを作成する
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
