import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';
import type { Member } from '../types';
import html2canvas from 'html2canvas-pro';

type Phase = 'filter' | 'sorting' | 'result';

interface SortState {
  candidates: Member[];
  bracket: Member[][];
  currentRound: number;
  currentMatchIndex: number;
  winners: Member[];
  finalRanking: Member[];
}

export function MemberSortPage() {
  const [phase, setPhase] = useState<Phase>('filter');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [includeGraduated, setIncludeGraduated] = useState(false);
  const [sortState, setSortState] = useState<SortState | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const selectedGroup = useMemo(() => {
    return groups?.find((g) => g.id === selectedGroupId);
  }, [groups, selectedGroupId]);

  const availableGenerations = useMemo(() => {
    if (!members || !selectedGroupId) return [];
    const gens = new Set<number>();
    members
      .filter((m) => m.groupId === selectedGroupId && m.generation)
      .forEach((m) => gens.add(m.generation!));
    return Array.from(gens).sort((a, b) => a - b);
  }, [members, selectedGroupId]);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((m) => {
      if (selectedGroupId && m.groupId !== selectedGroupId) return false;
      if (!includeGraduated && m.isGraduated) return false;
      if (
        selectedGenerations.length > 0 &&
        (!m.generation || !selectedGenerations.includes(m.generation))
      )
        return false;
      return true;
    });
  }, [members, selectedGroupId, selectedGenerations, includeGraduated]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startSort = () => {
    if (filteredMembers.length < 2) return;

    const shuffled = shuffleArray(filteredMembers);
    const bracket: Member[][] = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        bracket.push([shuffled[i], shuffled[i + 1]]);
      } else {
        bracket.push([shuffled[i]]);
      }
    }

    setSortState({
      candidates: shuffled,
      bracket,
      currentRound: 1,
      currentMatchIndex: 0,
      winners: [],
      finalRanking: [],
    });
    setPhase('sorting');
  };

  const handleChoice = useCallback(
    (winner: Member) => {
      if (!sortState) return;

      const currentMatch = sortState.bracket[sortState.currentMatchIndex];
      const loser = currentMatch.find((m) => m.id !== winner.id);
      const newWinners = [...sortState.winners, winner];
      const newRanking = loser
        ? [loser, ...sortState.finalRanking]
        : sortState.finalRanking;

      const nextMatchIndex = sortState.currentMatchIndex + 1;

      if (nextMatchIndex >= sortState.bracket.length) {
        if (newWinners.length === 1) {
          setSortState({
            ...sortState,
            winners: [],
            finalRanking: [newWinners[0], ...newRanking],
          });
          setPhase('result');
        } else {
          const newBracket: Member[][] = [];
          for (let i = 0; i < newWinners.length; i += 2) {
            if (i + 1 < newWinners.length) {
              newBracket.push([newWinners[i], newWinners[i + 1]]);
            } else {
              newBracket.push([newWinners[i]]);
            }
          }
          setSortState({
            ...sortState,
            bracket: newBracket,
            currentRound: sortState.currentRound + 1,
            currentMatchIndex: 0,
            winners: [],
            finalRanking: newRanking,
          });
        }
      } else {
        setSortState({
          ...sortState,
          currentMatchIndex: nextMatchIndex,
          winners: newWinners,
          finalRanking: newRanking,
        });
      }
    },
    [sortState]
  );

  const getPrimaryImage = (member: Member) => {
    return member.images.find((img) => img.isPrimary) ?? member.images[0];
  };

  const currentMatch = sortState?.bracket[sortState.currentMatchIndex];

  const totalMatches = useMemo(() => {
    if (!sortState) return 0;
    return sortState.candidates.length - 1;
  }, [sortState]);

  const completedMatches = useMemo(() => {
    if (!sortState) return 0;
    const matchesInPreviousRounds =
      sortState.candidates.length - Math.pow(2, Math.ceil(Math.log2(sortState.candidates.length) - sortState.currentRound + 1));
    return Math.max(0, matchesInPreviousRounds) + sortState.currentMatchIndex;
  }, [sortState]);

  const handleSaveImage = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#f8fafc',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'member-ranking.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  const handleReset = () => {
    setPhase('filter');
    setSortState(null);
  };

  if (membersLoading || groupsLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* フィルター画面 */}
          {phase === 'filter' && (
            <motion.div
              key="filter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                  Member Sort
                </h1>
                <p className="text-slate-500">
                  2択で選んで、あなただけのランキングを作ろう
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    グループ
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => {
                      setSelectedGroupId(e.target.value);
                      setSelectedGenerations([]);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">すべてのグループ</option>
                    {groups?.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedGroup?.hasGeneration && availableGenerations.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      期別
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableGenerations.map((gen) => (
                        <button
                          key={gen}
                          onClick={() => {
                            setSelectedGenerations((prev) =>
                              prev.includes(gen)
                                ? prev.filter((g) => g !== gen)
                                : [...prev, gen]
                            );
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedGenerations.includes(gen)
                              ? 'bg-primary-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {gen}期
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGraduated}
                      onChange={(e) => setIncludeGraduated(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-slate-700">卒業メンバーを含める</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-center text-slate-500 mb-4">
                    対象: <span className="font-semibold text-primary-500">{filteredMembers.length}</span> 名
                  </p>
                  <button
                    onClick={startSort}
                    disabled={filteredMembers.length < 2}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30"
                  >
                    ソート開始
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ソート画面 */}
          {phase === 'sorting' && currentMatch && (
            <motion.div
              key="sorting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  どちらが好き？
                </h2>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(completedMatches / totalMatches) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-slate-500">
                  Round {sortState?.currentRound}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {currentMatch.map((member, idx) => {
                  const image = getPrimaryImage(member);
                  return (
                    <motion.button
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9, x: idx === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChoice(member)}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                    >
                      <div className="aspect-[3/4] relative overflow-hidden">
                        {image ? (
                          <img
                            src={image.url}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                            <span className="text-5xl text-white font-bold">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="text-lg font-bold truncate">
                            {member.name}
                          </h3>
                          {member.generation && (
                            <p className="text-sm text-white/70">
                              {member.generation}期
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {currentMatch.length === 1 && (
                <div className="text-center">
                  <p className="text-slate-500 mb-4">
                    {currentMatch[0].name}は不戦勝です
                  </p>
                  <button
                    onClick={() => handleChoice(currentMatch[0])}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                  >
                    次へ
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* 結果画面 */}
          {phase === 'result' && sortState && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  Your Ranking
                </h1>
                <p className="text-slate-500">
                  あなたのランキングが完成しました！
                </p>
              </div>

              <div ref={resultRef} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="space-y-3">
                  {sortState.finalRanking.map((member, index) => {
                    const image = getPrimaryImage(member);
                    const isTop3 = index < 3;
                    const rankColors = [
                      'from-yellow-400 to-yellow-500',
                      'from-slate-300 to-slate-400',
                      'from-amber-600 to-amber-700',
                    ];

                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          isTop3 ? 'bg-slate-50' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                            isTop3
                              ? `bg-gradient-to-br ${rankColors[index]} text-white shadow-md`
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {index + 1}
                        </div>
                        {image ? (
                          <img
                            src={image.url}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {member.name}
                          </p>
                          {member.generation && (
                            <p className="text-sm text-slate-500">
                              {member.generation}期
                            </p>
                          )}
                        </div>
                        {member.isGraduated && (
                          <span className="text-xs px-2 py-1 bg-slate-200 text-slate-600 rounded-full">
                            卒業
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSaveImage}
                  className="px-6 py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  画像を保存
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30"
                >
                  もう一度
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
