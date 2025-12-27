import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { setlistsApi } from '../api/setlists';
import { songsApi } from '../api/songs';
import { groupsApi } from '../api/groups';
import { membersApi } from '../api/members';
import { Loading } from '../components/common/Loading';
import { ShareButton } from '../components/common/ShareButton';

export function SetlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

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
    const name = member.name;
    return name.length > 3 ? name.slice(0, 3) : name;
  };
  const getFullMemberName = (memberId: string | null) => {
    if (!memberId) return null;
    return members?.find((m) => m.id === memberId)?.name ?? null;
  };

  const sortedItems = [...setlist.items].sort((a, b) => a.order - b.order);

  const handleDownload = async () => {
    if (!downloadRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
      // 一時的に表示して画像生成
      downloadRef.current.style.position = 'absolute';
      downloadRef.current.style.left = '-9999px';
      downloadRef.current.style.display = 'block';

      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(downloadRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      downloadRef.current.style.display = 'none';

      // Blob生成
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png', 1.0);
      });

      if (!blob) {
        throw new Error('画像の生成に失敗しました');
      }

      const fileName = setlist.eventDate
        ? `${groupName}_${setlist.name}_${setlist.eventDate}.png`
        : `${groupName}_${setlist.name}.png`;
      const safeFileName = fileName.replace(/\//g, '-');

      // iOS Safari対応: share APIがあれば使う
      if (navigator.share && navigator.canShare?.({ files: [new File([blob], safeFileName, { type: 'image/png' })] })) {
        const file = new File([blob], safeFileName, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: setlist.name,
        });
      } else {
        // 通常のダウンロード
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = safeFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      alert('ダウンロードに失敗しました');
    } finally {
      setIsDownloading(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  画像保存
                </>
              )}
            </button>
            <Link
              to={`/setlists/${id}/edit`}
              className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              編集
            </Link>
          </div>
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
            <div className="flex items-center gap-3">
              <ShareButton
                title={`${groupName} ${setlist.name} | Idol Management`}
                text={`${groupName}のセットリスト「${setlist.name}」をチェック！`}
              />
              <div className="text-right">
                {setlist.eventDate && (
                  <p className="text-sm text-slate-500">{setlist.eventDate}</p>
                )}
                <p className="text-sm text-slate-400">{setlist.items.length}曲</p>
              </div>
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
          <div className="space-y-1">
            {sortedItems.map((item) => {
              const centerName = getMemberName(item.centerMemberId);
              return (
                <div
                  key={item.id}
                  className="flex items-baseline gap-1 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                >
                  <span className="text-rose-500 text-sm font-bold flex-shrink-0">
                    {item.order}.
                  </span>
                  <span className="text-sm text-slate-800">
                    {getSongTitle(item.songId)}
                  </span>
                  {centerName && (
                    <span className="text-xs text-rose-400 ml-1">
                      (C: {centerName})
                    </span>
                  )}
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

      {/* 画像ダウンロード用の隠し要素 */}
      <div
        ref={downloadRef}
        style={{ display: 'none', width: '400px' }}
      >
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 50%, #fff1f2 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}>
          {/* ヘッダー */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ color: '#f43f5e', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
              {groupName}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>
              {setlist.name}
            </div>
            {setlist.eventDate && (
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                {setlist.eventDate}
              </div>
            )}
          </div>

          {/* セトリ */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}>
            {sortedItems.map((item) => {
              const centerName = getFullMemberName(item.centerMemberId);
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                    padding: '6px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <span style={{ color: '#f43f5e', fontSize: '14px', fontWeight: 'bold', minWidth: '24px' }}>
                    {item.order}.
                  </span>
                  <span style={{ fontSize: '14px', color: '#1e293b', flex: 1 }}>
                    {getSongTitle(item.songId)}
                  </span>
                  {centerName && (
                    <span style={{ fontSize: '12px', color: '#fb7185' }}>
                      C: {centerName}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* フッター */}
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            fontSize: '12px',
            color: '#94a3b8',
          }}>
            全{setlist.items.length}曲
          </div>
        </div>
      </div>

      {/* ダウンロード中のオーバーレイ */}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3">
            <svg className="w-8 h-8 animate-spin text-rose-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-slate-700 font-medium">画像を作成中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
