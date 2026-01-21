import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MeetGreetConversation } from '../../types';
import { useExportToImage } from '../../hooks/useExportToImage';
import { ImagePreviewModal } from '../common/ImagePreviewModal';
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
  const { exportToImage, isExporting, previewImage, previewFileName, closePreview } = useExportToImage();
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
        className="btn-download"
      >
        {isExporting || isRendering ? (
          <>
            <span className="btn-download-spinner" />
            <span>保存中</span>
          </>
        ) : (
          <>
            <svg className="btn-download-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Image preview modal for mobile */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage}
          fileName={previewFileName}
          onClose={closePreview}
        />
      )}
    </>
  );
}
