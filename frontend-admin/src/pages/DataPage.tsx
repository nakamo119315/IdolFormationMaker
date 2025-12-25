import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { dataApi } from '../api/data';
import type { ExportDataDto, ImportResultDto } from '../api/data';

export function DataPage() {
  const [importResult, setImportResult] = useState<ImportResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportMutation = useMutation({
    mutationFn: dataApi.export,
    onSuccess: (data) => {
      // ファイルとしてダウンロード
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      a.download = `idol-data-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setError(null);
    },
    onError: (err) => {
      setError(`エクスポートに失敗しました: ${err.message}`);
    },
  });

  const importMutation = useMutation({
    mutationFn: (data: ExportDataDto) => dataApi.import(data, clearExisting),
    onSuccess: (result) => {
      setImportResult(result);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (err) => {
      setError(`インポートに失敗しました: ${err.message}`);
      setImportResult(null);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportDataDto;

      if (!data.version || !data.groups || !data.members) {
        throw new Error('無効なデータ形式です');
      }

      importMutation.mutate(data);
    } catch (err) {
      setError(`ファイルの読み込みに失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">データ管理</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {importResult && (
        <div
          className={`p-4 rounded-lg border ${
            importResult.success
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <p className="font-medium">{importResult.message}</p>
          {importResult.success && (
            <ul className="mt-2 text-sm">
              <li>グループ: {importResult.counts.groups}件</li>
              <li>メンバー: {importResult.counts.members}件</li>
              <li>フォーメーション: {importResult.counts.formations}件</li>
              <li>楽曲: {importResult.counts.songs}件</li>
              <li>セットリスト: {importResult.counts.setlists}件</li>
            </ul>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* エクスポート */}
        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">エクスポート</h2>
          <p className="text-gray-600 mb-4">
            全てのデータ（グループ、メンバー、フォーメーション、楽曲、セットリスト）をJSONファイルとしてダウンロードします。
          </p>
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportMutation.isPending ? 'エクスポート中...' : 'データをエクスポート'}
          </button>
        </div>

        {/* インポート */}
        <div className="p-6 bg-white rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">インポート</h2>
          <p className="text-gray-600 mb-4">
            エクスポートしたJSONファイルからデータを取り込みます。既存のデータと重複するIDは上書きされません。
          </p>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="text-sm text-gray-700">
                既存データを全て削除してからインポート
              </span>
            </label>
            {clearExisting && (
              <p className="mt-1 text-xs text-red-500">
                この操作は取り消せません。全ての既存データが削除されます。
              </p>
            )}
          </div>

          <label
            className={`block w-full px-4 py-2 text-center rounded-lg cursor-pointer transition-colors ${
              importMutation.isPending
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {importMutation.isPending ? 'インポート中...' : 'ファイルを選択してインポート'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={importMutation.isPending}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">注意事項</h3>
        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
          <li>エクスポートにはメンバー画像のURL情報が含まれますが、画像ファイル自体は含まれません</li>
          <li>インポート時、既に存在するIDのデータはスキップされます</li>
          <li>「既存データを削除」を選択した場合、全てのデータが削除されてからインポートが実行されます</li>
          <li>大量のデータを含むファイルのインポートには時間がかかる場合があります</li>
        </ul>
      </div>
    </div>
  );
}
