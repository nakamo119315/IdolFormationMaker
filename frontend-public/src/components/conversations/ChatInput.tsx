import { useState } from 'react';
import type { SpeakerType } from '../../types';

interface ChatInputProps {
  onSend: (message: { speakerType: SpeakerType; content: string }) => void;
  initialSpeaker?: SpeakerType;
  disabled?: boolean;
}

export function ChatInput({ onSend, initialSpeaker = 'Self', disabled = false }: ChatInputProps) {
  const [speakerType, setSpeakerType] = useState<SpeakerType>(initialSpeaker);
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (!content.trim() || disabled) return;

    onSend({ speakerType, content: content.trim() });
    setContent('');
    // Keep speaker selection for consecutive messages
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IME変換中（日本語入力確定時など）は送信しない
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSpeaker = () => {
    setSpeakerType(prev => prev === 'Self' ? 'Partner' : 'Self');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 bg-white border-t border-slate-200">
      {/* Speaker toggle button */}
      <button
        type="button"
        onClick={toggleSpeaker}
        disabled={disabled}
        className={`flex-shrink-0 min-h-[44px] px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          speakerType === 'Self'
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {speakerType === 'Self' ? '自分' : '相手'}
      </button>

      {/* Text input */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="メッセージを入力..."
        disabled={disabled}
        rows={1}
        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
        style={{ minHeight: '44px', maxHeight: '120px' }}
      />

      {/* Send button */}
      <button
        type="submit"
        disabled={!content.trim() || disabled}
        className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
}
