import { motion } from 'framer-motion';
import type { Formation, Member } from '../../types';

interface FormationStageProps {
  formation: Formation;
  members: Member[];
}

export function FormationStage({ formation, members }: FormationStageProps) {
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
        positions: positions.sort((a, b) => a.column - b.column),
      }));
  };

  const rows = getFormationRows();

  return (
    <div className="relative">
      {/* ステージ背景 */}
      <div className="bg-gradient-to-b from-slate-800 via-slate-700 to-slate-600 rounded-3xl p-8 shadow-2xl">
        {/* ステージ後方ラベル */}
        <div className="text-center mb-6">
          <span className="text-white/40 text-xs uppercase tracking-widest">Stage Back</span>
        </div>

        {/* フォーメーショングリッド */}
        <div className="flex flex-col gap-8 py-8">
          {rows.map(({ row, positions }, rowIndex) => (
            <motion.div
              key={row}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.15 }}
              className="flex justify-center gap-4 flex-wrap"
            >
              {positions.map((pos, posIndex) => {
                const member = getMember(pos.memberId);
                const imageUrl = getMemberImage(member);

                return (
                  <motion.div
                    key={pos.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: rowIndex * 0.15 + posIndex * 0.05 }}
                    className="relative group"
                  >
                    {/* ポジション番号バッジ */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-10 shadow-lg">
                      {pos.positionNumber}
                    </div>

                    {/* メンバー画像/プレースホルダー */}
                    <div className={`
                      w-20 h-20 rounded-full overflow-hidden
                      border-4 border-white/30 shadow-xl
                      transition-all duration-300
                      group-hover:border-primary-400 group-hover:scale-110
                      ${row === 1 ? 'w-24 h-24' : ''}
                    `}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={member?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {member?.name?.charAt(0) ?? '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* メンバー名 */}
                    <div className="mt-2 text-center">
                      <p className="text-white text-xs font-medium truncate max-w-20">
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
        <div className="text-center mt-6">
          <span className="text-white/40 text-xs uppercase tracking-widest">Stage Front</span>
        </div>

        {/* ステージエッジ装飾 */}
        <div className="mt-4 h-2 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent rounded-full" />
      </div>

      {/* 客席表示 */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-2 text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-sm">Audience</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
