import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  loading = false,
  disabled = false,
  placeholder = 'Sorunuzu yazın...',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || loading || disabled) return;

    onSendMessage(trimmedMessage);
    setMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="border-t border-[#FFB6A6]/60 bg-[#FFEBD3]/90 backdrop-blur-xs p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            rows={1}
            className={`
              w-full resize-none rounded-2xl border border-[#FFB6A6] bg-[#FFF7ED] px-4 py-3 text-sm text-[#2D1D19]
              placeholder:text-[#856761] focus:outline-none focus:ring-2 focus:ring-[#9BCEC1] focus:border-[#9BCEC1]
              disabled:opacity-60 disabled:cursor-not-allowed shadow-xs transition-all
            `}
            style={{ maxHeight: '120px' }}
          />

          {message.length > 500 && (
            <div className="text-xs text-[#856761] mt-1 text-right">
              {message.length}/1000
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={!message.trim() || loading || disabled}
          loading={loading}
          variant="primary"
          className="h-11 px-4 rounded-2xl shadow-sm"
        >
          {loading ? (
            <Square className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      <div className="flex items-center justify-between mt-2 max-w-4xl mx-auto px-1">
        <div className="text-xs text-[#5D433E]">
          <span className="font-semibold text-[#2D1D19]">Shift + Enter</span> ile yeni satır
        </div>

        {loading && (
          <div className="text-xs text-[#11342C] bg-[#9BCEC1]/30 px-3 py-1 rounded-full border border-[#9BCEC1] flex items-center gap-1.5 font-medium animate-pulse">
            <div className="w-1.5 h-1.5 bg-[#11342C] rounded-full"></div>
            <span>AI düşünüyor ve içerik sorguluyor...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;