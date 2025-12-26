import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';
import type { Member } from '../types';
import html2canvas from 'html2canvas-pro';

type Phase = 'filter' | 'sorting' | 'result';

interface MergeSortState {
  // Working arrays for merge sort
  segments: Member[][];
  // Current merge state
  leftIndex: number;
  rightIndex: number;
  mergedSoFar: Member[];
  currentLeft: Member[];
  currentRight: Member[];
  // Comparisons tracking
  completedComparisons: number;
  // Final result
  finalRanking: Member[];
}

export function MemberSortPage() {
  const [phase, setPhase] = useState<Phase>('filter');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [includeGraduated, setIncludeGraduated] = useState(false);
  const [sortState, setSortState] = useState<MergeSortState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

  // Estimate total comparisons for merge sort: O(n log n)
  const estimateComparisons = (n: number): number => {
    if (n <= 1) return 0;
    return Math.ceil(n * Math.log2(n));
  };

  // Calculate remaining comparisons based on current state
  const calculateRemainingComparisons = (state: MergeSortState): number => {
    if (state.finalRanking.length > 0) return 0;

    let remaining = 0;
    const { segments, leftIndex, rightIndex, currentLeft, currentRight } = state;

    // Current merge: remaining comparisons = min of remaining elements on each side
    const leftRemaining = currentLeft.length - leftIndex;
    const rightRemaining = currentRight.length - rightIndex;
    // Worst case for current merge
    remaining += Math.min(leftRemaining, rightRemaining);

    // Future merges: estimate based on segment sizes
    // Get sizes of all segments (excluding current pair being merged)
    const futureSizes = segments
      .filter(s => s !== currentLeft && s !== currentRight)
      .map(s => s.length);
    // Add the result of current merge
    futureSizes.push(currentLeft.length + currentRight.length);

    // Estimate remaining merge rounds
    while (futureSizes.length > 1) {
      const sorted = [...futureSizes].sort((a, b) => a - b);
      const newSizes: number[] = [];
      for (let i = 0; i < sorted.length; i += 2) {
        if (i + 1 < sorted.length) {
          // Merge two segments: worst case is min(size1, size2) comparisons
          remaining += Math.min(sorted[i], sorted[i + 1]);
          newSizes.push(sorted[i] + sorted[i + 1]);
        } else {
          newSizes.push(sorted[i]);
        }
      }
      futureSizes.length = 0;
      futureSizes.push(...newSizes);
    }

    return remaining;
  };

  const startSort = () => {
    if (filteredMembers.length < 2) return;

    const shuffled = shuffleArray(filteredMembers);
    // Initialize segments: each member is its own sorted segment
    const segments = shuffled.map((m) => [m]);

    setSortState({
      segments,
      leftIndex: 0,
      rightIndex: 0,
      mergedSoFar: [],
      currentLeft: segments[0],
      currentRight: segments.length > 1 ? segments[1] : [],
      completedComparisons: 0,
      finalRanking: [],
    });
    setPhase('sorting');
  };

  const advanceMergeSort = (state: MergeSortState, winner: Member): MergeSortState => {
    const { leftIndex, rightIndex, mergedSoFar, currentLeft, currentRight } = state;

    // Determine which side the winner came from
    const leftMember = currentLeft[leftIndex];
    const winnerIsLeft = winner.id === leftMember?.id;

    const newMerged = [...mergedSoFar, winner];
    let newLeftIndex = winnerIsLeft ? leftIndex + 1 : leftIndex;
    let newRightIndex = winnerIsLeft ? rightIndex : rightIndex + 1;

    // Check if one side is exhausted
    if (newLeftIndex >= currentLeft.length) {
      // Left exhausted, append remaining right
      const finalMerged = [...newMerged, ...currentRight.slice(newRightIndex)];
      return finishCurrentMerge(state, finalMerged);
    }
    if (newRightIndex >= currentRight.length) {
      // Right exhausted, append remaining left
      const finalMerged = [...newMerged, ...currentLeft.slice(newLeftIndex)];
      return finishCurrentMerge(state, finalMerged);
    }

    // Continue current merge
    return {
      ...state,
      leftIndex: newLeftIndex,
      rightIndex: newRightIndex,
      mergedSoFar: newMerged,
      completedComparisons: state.completedComparisons + 1,
    };
  };

  const finishCurrentMerge = (state: MergeSortState, mergedSegment: Member[]): MergeSortState => {
    const { segments, currentLeft, currentRight } = state;

    // Find the indices of current segments
    const leftSegmentIndex = segments.findIndex((s) => s === currentLeft);
    const rightSegmentIndex = segments.findIndex((s) => s === currentRight);

    // Create new segments array with merged result
    const newSegments = segments.filter(
      (_, i) => i !== leftSegmentIndex && i !== rightSegmentIndex
    );
    newSegments.push(mergedSegment);

    // If only one segment left, we're done!
    if (newSegments.length === 1) {
      return {
        ...state,
        segments: newSegments,
        finalRanking: newSegments[0],
        completedComparisons: state.completedComparisons + 1,
      };
    }

    // Start next merge
    return {
      ...state,
      segments: newSegments,
      leftIndex: 0,
      rightIndex: 0,
      mergedSoFar: [],
      currentLeft: newSegments[0],
      currentRight: newSegments[1],
      completedComparisons: state.completedComparisons + 1,
    };
  };

  const handleChoice = (winner: Member) => {
    if (!sortState) return;

    const newState = advanceMergeSort(sortState, winner);
    setSortState(newState);

    if (newState.finalRanking.length > 0) {
      setPhase('result');
    }
  };

  const getPrimaryImage = (member: Member) => {
    return member.images.find((img) => img.isPrimary) ?? member.images[0];
  };

  // Current comparison pair
  const currentPair = useMemo(() => {
    if (!sortState || sortState.finalRanking.length > 0) return null;
    const left = sortState.currentLeft[sortState.leftIndex];
    const right = sortState.currentRight[sortState.rightIndex];
    if (!left || !right) return null;
    return [left, right];
  }, [sortState]);

  // Calculate remaining comparisons dynamically
  const remainingComparisons = useMemo(() => {
    if (!sortState) return 0;
    return calculateRemainingComparisons(sortState);
  }, [sortState]);

  const totalEstimated = useMemo(() => {
    if (!sortState) return 0;
    return sortState.completedComparisons + remainingComparisons;
  }, [sortState, remainingComparisons]);

  const progressPercent = useMemo(() => {
    if (!sortState || totalEstimated === 0) return 0;
    return Math.min(100, (sortState.completedComparisons / totalEstimated) * 100);
  }, [sortState, totalEstimated]);

  const handleSaveImage = async () => {
    if (!resultRef.current || isSaving) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#f8fafc',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `member-ranking-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSaveMessage({ type: 'success', text: '画像を保存しました' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save image:', error);
      setSaveMessage({ type: 'error', text: '画像の保存に失敗しました' });
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPhase('filter');
    setSortState(null);
  };

  if (membersLoading || groupsLoading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 sm:pt-24 pb-16">
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
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                  Member Sort
                </h1>
                <p className="text-slate-500">
                  2択で選んで、あなただけのランキングを作ろう
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-6">
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
                    {filteredMembers.length >= 2 && (
                      <span className="text-sm text-slate-400 ml-2">
                        (約{estimateComparisons(filteredMembers.length)}回比較)
                      </span>
                    )}
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
          {phase === 'sorting' && currentPair && (
            <motion.div
              key="sorting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                  どちらが好き？
                </h2>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-sm text-slate-500">
                  {sortState?.completedComparisons}回完了 / 残り約{remainingComparisons}回
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {currentPair.map((member, idx) => {
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
                            <span className="text-4xl sm:text-5xl text-white font-bold">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                          <h3 className="text-base sm:text-lg font-bold truncate">
                            {member.name}
                          </h3>
                          {member.generation && (
                            <p className="text-xs sm:text-sm text-white/70">
                              {member.generation}期
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
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
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  Your Ranking
                </h1>
                <p className="text-slate-500">
                  あなたのランキングが完成しました！
                </p>
              </div>

              <div ref={resultRef} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="space-y-2">
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
                        transition={{ delay: index * 0.03 }}
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl ${
                          isTop3 ? 'bg-slate-50' : ''
                        }`}
                      >
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-xs sm:text-sm ${
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
                            crossOrigin="anonymous"
                            className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate text-sm sm:text-base">
                            {member.name}
                          </p>
                          {member.generation && (
                            <p className="text-xs sm:text-sm text-slate-500">
                              {member.generation}期
                            </p>
                          )}
                        </div>
                        {member.isGraduated && (
                          <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full flex-shrink-0">
                            卒業
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {saveMessage && (
                <div
                  className={`text-center py-2 px-4 rounded-lg ${
                    saveMessage.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSaveImage}
                  disabled={isSaving}
                  className="px-6 py-3 bg-white text-slate-700 rounded-xl font-medium border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      保存中...
                    </>
                  ) : (
                    <>
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      画像を保存
                    </>
                  )}
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
