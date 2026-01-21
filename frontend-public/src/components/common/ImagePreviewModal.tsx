interface ImagePreviewModalProps {
  imageUrl: string;
  fileName: string;
  onClose: () => void;
}

// LINE内部ブラウザかどうかを判定
const isLineApp = () => /Line\//i.test(navigator.userAgent);
const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

export function ImagePreviewModal({ imageUrl, fileName, onClose }: ImagePreviewModalProps) {
  const isLine = isLineApp();
  const isiOS = isIOS();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="text-white text-center mb-4 max-w-xs">
        <p className="text-lg font-medium">画像を長押しして保存</p>
        {isLine ? (
          <p className="text-sm text-amber-300 mt-2">
            {isiOS
              ? 'LINEアプリ内では保存できない場合があります。右上の「...」からブラウザで開いてください'
              : 'LINEアプリ内では保存できない場合があります。右上メニューから「他のブラウザで開く」を選択してください'}
          </p>
        ) : (
          <p className="text-sm text-white/60 mt-1">タップで閉じる</p>
        )}
      </div>
      <img
        src={imageUrl}
        alt={fileName}
        className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
      >
        閉じる
      </button>
    </div>
  );
}
