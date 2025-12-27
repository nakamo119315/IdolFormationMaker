import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shareUrl = url || window.location.href;
  const shareText = text || title;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToLine = () => {
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(lineUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('URLをコピーしました');
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('URLをコピーしました');
    }
    setIsOpen(false);
  };

  return (
    <div className="share-button-container">
      <button className="share-button" onClick={handleNativeShare} aria-label="シェア">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        シェア
      </button>

      {isOpen && !navigator.share && (
        <div className="share-dropdown">
          <button onClick={shareToTwitter} className="share-option">
            <span className="share-icon twitter">𝕏</span>
            X(Twitter)
          </button>
          <button onClick={shareToLine} className="share-option">
            <span className="share-icon line">L</span>
            LINE
          </button>
          <button onClick={shareToFacebook} className="share-option">
            <span className="share-icon facebook">f</span>
            Facebook
          </button>
          <button onClick={copyToClipboard} className="share-option">
            <span className="share-icon copy">📋</span>
            URLをコピー
          </button>
        </div>
      )}
    </div>
  );
}
