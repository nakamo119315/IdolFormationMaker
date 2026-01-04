import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';
import type { Member } from '../types';
import html2canvas from 'html2canvas-pro';

type Phase = 'filter' | 'sorting' | 'result';

interface MergeSortState {
  segments: Member[][];
  leftIndex: number;
  rightIndex: number;
  mergedSoFar: Member[];
  currentLeft: Member[];
  currentRight: Member[];
  completedComparisons: number;
  finalRanking: Member[];
}

// Base64画像キャッシュ
const imageCache = new Map<string, string>();

// 画像をBase64に変換
async function imageToBase64(url: string): Promise<string | null> {
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        imageCache.set(url, base64);
        resolve(base64);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// 画像コンポーネント（エラーハンドリング付き）
function MemberImage({
  src,
  alt,
  className,
  fallbackClassName,
  base64Src,
}: {
  src?: string;
  alt: string;
  className: string;
  fallbackClassName?: string;
  base64Src?: string | null;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageSrc = base64Src || src;

  if (!imageSrc || hasError) {
    return (
      <div className={fallbackClassName || className}>
        <span className="text-white font-bold text-2xl sm:text-3xl">
          {alt.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div className={`${className} animate-pulse`} style={{ background: 'linear-gradient(135deg, #7e1083, #580c5c)' }} />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ transition: 'opacity 0.3s' }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </>
  );
}

export function MemberSortPage() {
  const [phase, setPhase] = useState<Phase>('filter');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [includeGraduated, setIncludeGraduated] = useState(false);
  const [sortState, setSortState] = useState<MergeSortState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [base64Images, setBase64Images] = useState<Map<string, string>>(new Map());
  const [imagesLoading, setImagesLoading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // 結果画面になったら画像をBase64にプリロード
  useEffect(() => {
    if (phase === 'result' && sortState?.finalRanking) {
      const loadImages = async () => {
        setImagesLoading(true);
        const newBase64Map = new Map<string, string>();

        for (const member of sortState.finalRanking) {
          const primaryImage = member.images.find((img) => img.isPrimary) ?? member.images[0];
          if (primaryImage?.url) {
            const base64 = await imageToBase64(primaryImage.url);
            if (base64) {
              newBase64Map.set(member.id, base64);
            }
          }
        }

        setBase64Images(newBase64Map);
        setImagesLoading(false);
      };
      loadImages();
    }
  }, [phase, sortState?.finalRanking]);

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

  const estimateComparisons = (n: number): number => {
    if (n <= 1) return 0;
    return Math.ceil(n * Math.log2(n));
  };

  const calculateRemainingComparisons = (state: MergeSortState): number => {
    if (state.finalRanking.length > 0) return 0;

    let remaining = 0;
    const { segments, leftIndex, rightIndex, currentLeft, currentRight } = state;

    const leftRemaining = currentLeft.length - leftIndex;
    const rightRemaining = currentRight.length - rightIndex;
    remaining += Math.min(leftRemaining, rightRemaining);

    const futureSizes = segments
      .filter(s => s !== currentLeft && s !== currentRight)
      .map(s => s.length);
    futureSizes.push(currentLeft.length + currentRight.length);

    while (futureSizes.length > 1) {
      const sorted = [...futureSizes].sort((a, b) => a - b);
      const newSizes: number[] = [];
      for (let i = 0; i < sorted.length; i += 2) {
        if (i + 1 < sorted.length) {
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

    const leftMember = currentLeft[leftIndex];
    const winnerIsLeft = winner.id === leftMember?.id;

    const newMerged = [...mergedSoFar, winner];
    const newLeftIndex = winnerIsLeft ? leftIndex + 1 : leftIndex;
    const newRightIndex = winnerIsLeft ? rightIndex : rightIndex + 1;

    if (newLeftIndex >= currentLeft.length) {
      const finalMerged = [...newMerged, ...currentRight.slice(newRightIndex)];
      return finishCurrentMerge(state, finalMerged);
    }
    if (newRightIndex >= currentRight.length) {
      const finalMerged = [...newMerged, ...currentLeft.slice(newLeftIndex)];
      return finishCurrentMerge(state, finalMerged);
    }

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

    const leftSegmentIndex = segments.findIndex((s) => s === currentLeft);
    const rightSegmentIndex = segments.findIndex((s) => s === currentRight);

    const newSegments = segments.filter(
      (_, i) => i !== leftSegmentIndex && i !== rightSegmentIndex
    );
    newSegments.push(mergedSegment);

    if (newSegments.length === 1) {
      return {
        ...state,
        segments: newSegments,
        finalRanking: newSegments[0],
        completedComparisons: state.completedComparisons + 1,
      };
    }

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

  const currentPair = useMemo(() => {
    if (!sortState || sortState.finalRanking.length > 0) return null;
    const left = sortState.currentLeft[sortState.leftIndex];
    const right = sortState.currentRight[sortState.rightIndex];
    if (!left || !right) return null;
    return [left, right];
  }, [sortState]);

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
        backgroundColor: '#faf5ff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
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
    <div className="min-h-screen gradient-bg pt-20 sm:pt-24 pb-16">
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
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-700 mb-4">
                  Member Sort
                </h1>
                <p className="text-primary-600/70">
                  2択で選んで、あなただけのランキングを作ろう
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-100 p-4 sm:p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-primary-800 mb-2">
                    グループ
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => {
                      setSelectedGroupId(e.target.value);
                      setSelectedGenerations([]);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
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
                    <label className="block text-sm font-medium text-primary-800 mb-2">
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
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedGenerations.includes(gen)
                              ? 'bg-primary-500 text-white shadow-md'
                              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
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
                      className="w-5 h-5 rounded border-primary-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-primary-800">卒業メンバーを含める</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-primary-100">
                  <p className="text-center text-primary-600 mb-4">
                    対象: <span className="font-bold text-primary-700">{filteredMembers.length}</span> 名
                    {filteredMembers.length >= 2 && (
                      <span className="text-sm text-primary-500 ml-2">
                        (約{estimateComparisons(filteredMembers.length)}回比較)
                      </span>
                    )}
                  </p>
                  <button
                    onClick={startSort}
                    disabled={filteredMembers.length < 2}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
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
                <h2 className="text-xl sm:text-2xl font-bold text-primary-700 mb-4">
                  どちらが好き？
                </h2>
                <div className="bg-white/60 backdrop-blur-sm rounded-full p-1 mb-2">
                  <div className="w-full bg-primary-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-400 to-primary-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-primary-600">
                  {sortState?.completedComparisons}回完了 / 残り約{remainingComparisons}回
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-6">
                {currentPair.map((member, idx) => {
                  const image = getPrimaryImage(member);
                  return (
                    <motion.button
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9, x: idx === 0 ? -20 : 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChoice(member)}
                      className="bg-white rounded-2xl shadow-xl overflow-hidden group border-2 border-transparent hover:border-primary-300 transition-all"
                    >
                      <div className="aspect-[3/4] relative overflow-hidden">
                        <MemberImage
                          src={image?.url}
                          alt={member.name}
                          className="w-full h-full object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-110"
                          fallbackClassName="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white">
                          <h3 className="text-base sm:text-lg font-bold truncate drop-shadow-md">
                            {member.name}
                          </h3>
                          {member.generation && (
                            <p className="text-xs sm:text-sm text-white/80">
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
                <h1 className="text-2xl sm:text-3xl font-bold text-primary-700 mb-2">
                  Your Ranking
                </h1>
                <p className="text-primary-600/70">
                  あなたのランキングが完成しました！
                </p>
              </div>

              <div ref={resultRef} className="rounded-2xl shadow-xl border border-primary-200 p-4 sm:p-6" style={{ background: 'linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 30%, #c4a0f5 60%, #e0d0fa 100%)' }}>
                <div className="space-y-2">
                  {sortState.finalRanking.map((member, index) => {
                    const image = getPrimaryImage(member);
                    const isTop3 = index < 3;
                    const rankStyles = [
                      { bg: 'bg-gradient-to-r from-yellow-400 to-amber-500', text: 'text-white', shadow: 'shadow-amber-300' },
                      { bg: 'bg-gradient-to-r from-slate-300 to-slate-400', text: 'text-white', shadow: 'shadow-slate-300' },
                      { bg: 'bg-gradient-to-r from-amber-600 to-amber-700', text: 'text-white', shadow: 'shadow-amber-400' },
                    ];

                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-colors ${
                          isTop3 ? 'bg-white/90 shadow-sm' : 'bg-white/60 hover:bg-white/80'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm sm:text-base ${
                            isTop3
                              ? `${rankStyles[index].bg} ${rankStyles[index].text} shadow-md ${rankStyles[index].shadow}`
                              : 'bg-primary-100 text-primary-700'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-full overflow-hidden border-2 border-primary-200 shadow-md">
                          <MemberImage
                            src={image?.url}
                            alt={member.name}
                            className="w-full h-full object-cover"
                            fallbackClassName="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center"
                            base64Src={base64Images.get(member.id)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-primary-800 truncate text-sm sm:text-base">
                            {member.name}
                          </p>
                          {member.generation && (
                            <p className="text-xs sm:text-sm text-primary-500">
                              {member.generation}期
                            </p>
                          )}
                        </div>
                        {member.isGraduated && (
                          <span className="text-xs px-2 py-1 bg-primary-100 text-primary-600 rounded-full flex-shrink-0 font-medium">
                            卒業
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {saveMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-center py-3 px-4 rounded-xl ${
                    saveMessage.type === 'success'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  {saveMessage.text}
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleSaveImage}
                  disabled={isSaving || imagesLoading}
                  className="btn-download-outline"
                >
                  {isSaving || imagesLoading ? (
                    <>
                      <span className="btn-download-spinner" style={{ borderTopColor: '#7e1083', borderColor: 'rgba(126, 16, 131, 0.3)' }} />
                      {imagesLoading ? '画像読込中...' : '保存中...'}
                    </>
                  ) : (
                    <>
                      <svg
                        className="btn-download-icon"
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
                  className="btn-download"
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
