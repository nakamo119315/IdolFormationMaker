import { useState } from 'react';
import html2canvas from 'html2canvas-pro';

export function useExportToImage() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToImage = async (element: HTMLElement, filename: string) => {
    setIsExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToImage, isExporting };
}
