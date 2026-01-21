import { useState } from 'react';
import html2canvas from 'html2canvas-pro';

// モバイルデバイスかどうかを判定
export const isMobileDevice = () =>
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// LINE内部ブラウザかどうかを判定
export const isLineApp = () => /Line\//i.test(navigator.userAgent);

export function useExportToImage() {
  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>('');

  const exportToImage = async (
    element: HTMLElement,
    filename: string,
    options?: {
      backgroundColor?: string;
      scale?: number;
    }
  ) => {
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: options?.scale ?? window.devicePixelRatio * 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: options?.backgroundColor ?? '#ffffff',
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');

      if (isMobileDevice()) {
        // モバイルの場合はプレビュー表示（長押しで保存）
        setPreviewImage(dataUrl);
        setPreviewFileName(filename);
      } else {
        // PCの場合は通常のダウンロード
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Failed to export image:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewFileName('');
  };

  return {
    exportToImage,
    isExporting,
    previewImage,
    previewFileName,
    closePreview,
  };
}
