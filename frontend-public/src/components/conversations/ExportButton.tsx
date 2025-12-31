import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MeetGreetConversation } from '../../types';
import { useExportToImage } from '../../hooks/useExportToImage';
import ExportableChat from './ExportableChat';

interface ExportButtonProps {
  conversation: MeetGreetConversation;
  partnerName?: string;
}

export default function ExportButton({
  conversation,
  partnerName,
}: ExportButtonProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const { exportToImage, isExporting } = useExportToImage();
  const [isRendering, setIsRendering] = useState(false);

  const handleExport = async () => {
    // First, make the element visible for rendering
    setIsRendering(true);

    // Wait for React to render and layout to complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!exportRef.current) {
      setIsRendering(false);
      return;
    }

    try {
      const date = new Date(conversation.conversationDate);
      const filename = `conversation_${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.png`;

      await exportToImage(exportRef.current, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('画像のダウンロードに失敗しました');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <>
      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={isExporting || isRendering}
        className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isExporting || isRendering ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>保存中</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>画像保存</span>
          </>
        )}
      </button>

      {/* Exportable chat - rendered for capture */}
      {isRendering &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              opacity: 0,
              pointerEvents: 'none',
            }}
          >
            <ExportableChat
              ref={exportRef}
              conversation={conversation}
              partnerName={partnerName}
            />
          </div>,
          document.body
        )}
    </>
  );
}
