import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formationsApi } from '../api/formations';
import { membersApi } from '../api/members';
import { FormationStage } from '../components/formations/FormationStage';
import { Loading } from '../components/common/Loading';
import type { Formation } from '../types';

export function FormationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  const { data: formations, isLoading: formationsLoading } = useQuery({
    queryKey: ['formations'],
    queryFn: formationsApi.getAll,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: formationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] });
      setSelectedFormation(null);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('このフォーメーションを削除しますか？')) {
      deleteMutation.mutate(id);
    }
  };

  if (formationsLoading || membersLoading) return <Loading />;

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
            Formations
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto mb-6">
            ステージを彩るフォーメーション
          </p>
          <button
            onClick={() => navigate('/formations/new')}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30"
          >
            + 新規作成
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 overflow-hidden">
          {/* フォーメーション一覧 */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-4">
              {formations?.map((formation, index) => (
                <motion.button
                  key={formation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedFormation(formation)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 ${
                    selectedFormation?.id === formation.id
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-white hover:bg-slate-50 shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{formation.name}</h3>
                      <p className={`text-sm ${
                        selectedFormation?.id === formation.id ? 'text-white/70' : 'text-slate-500'
                      }`}>
                        {formation.positions.length} positions
                      </p>
                    </div>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/formations/${formation.id}/edit`)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedFormation?.id === formation.id
                            ? 'hover:bg-white/20 text-white'
                            : 'hover:bg-slate-100 text-slate-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(formation.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedFormation?.id === formation.id
                            ? 'hover:bg-white/20 text-white'
                            : 'hover:bg-red-50 text-red-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.button>
              ))}

              {formations?.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  フォーメーションが登録されていません
                </div>
              )}
            </div>
          </div>

          {/* フォーメーション表示 */}
          <div className="lg:col-span-2 order-1 lg:order-2 overflow-hidden">
            {selectedFormation && members ? (
              <motion.div
                key={selectedFormation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {selectedFormation.name}
                  </h2>
                </div>
                <FormationStage formation={selectedFormation} members={members} />
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-slate-100 rounded-3xl">
                <div className="text-center text-slate-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="hidden lg:block">左のリストからフォーメーションを選択してください</p>
                  <p className="lg:hidden">下のリストからフォーメーションを選択してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
