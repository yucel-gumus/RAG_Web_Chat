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
    
    // Reset textarea height
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
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || loading}
            rows={1}
            className={`
              w-full resize-none rounded-lg border border-gray-300 px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              placeholder-gray-600 text-sm text-gray-900
            `}
            style={{ maxHeight: '120px' }}
          />
          
          {/* Character limit indicator */}
          {message.length > 500 && (
            <div className="text-xs text-gray-500 mt-1 text-right">
              {message.length}/1000
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || loading || disabled}
          loading={loading}
          className="px-3 py-2"
        >
          {loading ? (
            <Square className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-gray-500">
          <span className="font-medium">Shift + Enter</span> ile yeni satır
        </div>
        
        {loading && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <div className="animate-pulse w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="animate-pulse w-1 h-1 bg-gray-400 rounded-full delay-100"></div>
            <div className="animate-pulse w-1 h-1 bg-gray-400 rounded-full delay-200"></div>
            <span className="ml-1">AI yanıt veriyor...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput; 