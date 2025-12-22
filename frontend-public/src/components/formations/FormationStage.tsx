import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas-pro';
import type { Formation, Member } from '../../types';

interface FormationStageProps {
  formation: Formation;
  members: Member[];
}

export function FormationStage({ formation, members }: FormationStageProps) {
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 375);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleDownload = async () => {
    if (!stageRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(stageRef.current, {
        backgroundColor: '#334155',
        scale: window.devicePixelRatio * 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');

      if (isMobile) {
        // スマホの場合はプレビュー表示（長押しで保存）
        setPreviewImage(dataUrl);
      } else {
        // PCの場合は通常のダウンロード
        const link = document.createElement('a');
        link.download = `${formation.name}_formation.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Failed to download:', error);
    } finally {
      setIsDownloading(false);
    }
  };
  // メンバー情報を取得
  const getMember = (memberId: string) => members.find(m => m.id === memberId);

  // メンバーの画像URL取得
  const getMemberImage = (member: Member | undefined) => {
    if (!member) return null;
    const primaryImage = member.images.find(img => img.isPrimary) ?? member.images[0];
    return primaryImage?.url ?? null;
  };

  // 列ごとにグループ化し、row番号の大きい順（後方から）に並べる
  const getFormationRows = () => {
    const rowMap = new Map<number, typeof formation.positions>();
    formation.positions.forEach(pos => {
      const existing = rowMap.get(pos.row) || [];
      existing.push(pos);
      rowMap.set(pos.row, existing);
    });

    // 大きいrow番号から（上から下へ＝後方から前方へ）
    return Array.from(rowMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([row, positions]) => ({
        row,
        positions: positions.sort((a, b) => a.positionNumber - b.positionNumber),
      }));
  };

  const rows = getFormationRows();

  // 最大の列数を計算してスケーリングに使用
  const maxPositionsInRow = Math.max(...rows.map(r => r.positions.length), 1);

  return (
    <div className="relative w-full overflow-hidden">
      {/* ダウンロードボタン */}
      <div className="flex justify-end mb-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-400 text-white text-sm font-medium rounded-full transition-colors shadow-lg"
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>処理中...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>画像保存</span>
            </>
          )}
        </button>
      </div>

      {/* ステージ背景 */}
      <div ref={stageRef} className="bg-gradient-to-b from-slate-800 via-slate-700 to-slate-600 rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-2xl overflow-hidden">
        {/* ステージ後方ラベル */}
        <div className="text-center mb-2 sm:mb-6">
          <span className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest">Stage Back</span>
        </div>

        {/* フォーメーショングリッド */}
        <div className="flex flex-col gap-3 sm:gap-8 py-2 sm:py-8">
          {rows.map(({ row, positions }, rowIndex) => (
            <motion.div
              key={row}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.15 }}
              className="flex justify-center items-center"
              style={{ gap: screenWidth >= 640 ? (maxPositionsInRow > 8 ? '6px' : maxPositionsInRow > 6 ? '10px' : '14px') : (maxPositionsInRow > 8 ? '2px' : maxPositionsInRow > 6 ? '4px' : '6px') }}
            >
              {positions.map((pos, posIndex) => {
                const member = getMember(pos.memberId);
                const imageUrl = getMemberImage(member);
                // 画面幅と行の人数に応じてサイズ調整（必ず1行に収まるように）
                const isLargeScreen = screenWidth >= 640;
                const rowCount = positions.length;
                const availableWidth = screenWidth - 40; // パディング分を引く
                const gapSize = isLargeScreen ? (rowCount > 8 ? 6 : rowCount > 6 ? 10 : 14) : (rowCount > 8 ? 2 : rowCount > 6 ? 4 : 6);
                const maxSizeForRow = Math.floor((availableWidth - (gapSize * (rowCount - 1))) / rowCount) - 8;

                // 基本サイズと画面幅から算出したサイズの小さい方を使用
                const isFirstRow = row === 1;
                const baseDesiredSize = isLargeScreen ? (isFirstRow ? 72 : 60) : (isFirstRow ? 48 : 40);
                const size = Math.min(baseDesiredSize, maxSizeForRow);

                return (
                  <motion.div
                    key={pos.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: rowIndex * 0.15 + posIndex * 0.05 }}
                    className="relative group flex-shrink-0"
                    style={{ width: `${size + 8}px` }}
                  >
                    {/* ポジション番号バッジ */}
                    <div
                      className="absolute -top-1 -right-1 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold z-10 shadow-lg"
                      style={{
                        width: `${Math.max(12, Math.round(size * 0.3))}px`,
                        height: `${Math.max(12, Math.round(size * 0.3))}px`,
                        fontSize: `${Math.max(7, Math.round(size * 0.18))}px`
                      }}
                    >
                      {pos.positionNumber}
                    </div>

                    {/* メンバー画像/プレースホルダー */}
                    <div
                      className="rounded-full overflow-hidden border-2 border-white/30 shadow-xl transition-all duration-300 group-hover:border-primary-400 group-hover:scale-110 mx-auto"
                      style={{ width: `${size}px`, height: `${size}px` }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={member?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <span className="text-white font-bold" style={{ fontSize: `${size / 3}px` }}>
                            {member?.name?.charAt(0) ?? '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* メンバー名 */}
                    <div className="mt-1 text-center">
                      <p
                        className="text-white font-medium truncate"
                        style={{ fontSize: `${Math.max(7, Math.round(size * 0.2))}px` }}
                      >
                        {member?.name ?? '未設定'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ))}
        </div>

        {/* ステージ前方ラベル */}
        <div className="text-center mt-3 sm:mt-6">
          <span className="text-white/40 text-[10px] sm:text-xs uppercase tracking-widest">Stage Front</span>
        </div>

        {/* ステージエッジ装飾 */}
        <div className="mt-2 sm:mt-4 h-1 sm:h-2 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-full" />
      </div>

      {/* 客席表示 */}
      <div className="mt-4 sm:mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-slate-400">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-xs sm:text-sm">Audience</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 画像プレビューモーダル（スマホ用） */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="text-white text-center mb-4">
            <p className="text-lg font-medium">画像を長押しして保存</p>
            <p className="text-sm text-white/60 mt-1">タップで閉じる</p>
          </div>
          <img
            src={previewImage}
            alt={formation.name}
            className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
}
