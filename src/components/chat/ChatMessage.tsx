import React from 'react';
import { User, Bot, Copy, ExternalLink } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>
      {/* Avatar */}
      <div
        className={`
        flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs border
        ${isUser
          ? 'bg-[#9BCEC1] text-[#11342C] border-[#86BBAE]'
          : 'bg-[#FFB6A6] text-[#2D1D19] border-[#EFA696]'
        }
      `}
      >
        {isUser ? <User className="h-4 w-4 stroke-[2.5]" /> : <Bot className="h-4 w-4 stroke-[2.5]" />}
      </div>

      {/* Message Body */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`
          inline-block p-4 rounded-2xl shadow-xs border transition-all text-sm leading-relaxed
          ${isUser
            ? 'bg-[#9BCEC1] text-[#11342C] border-[#86BBAE] font-medium rounded-tr-xs'
            : 'bg-[#FFF7ED] text-[#2D1D19] border-[#FFB6A6] rounded-tl-xs'
          }
        `}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-[#FFB6A6]/60 text-left">
              <p className="text-xs font-semibold text-[#856761] uppercase tracking-wider mb-2">Kaynaklar:</p>
              <div className="space-y-1.5">
                {message.sources.map((source, index) => {
                  const [title, url] =
                    source.includes('(') && source.includes(')')
                      ? [source.split('(')[0].trim(), source.split('(')[1].replace(')', '')]
                      : [source, source];

                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#2D1D19] bg-[#FFB6A6]/30 px-2.5 py-1 rounded-lg border border-[#FFB6A6] hover:bg-[#9BCEC1]/40 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3 text-[#11342C]" />
                      <span className="truncate max-w-xs">{title}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Message Footer */}
        <div
          className={`
          flex items-center gap-2 mt-1.5 text-xs text-[#856761] px-1
          ${isUser ? 'justify-end' : 'justify-start'}
        `}
        >
          <span>{formatTime(message.timestamp)}</span>
          <button
            onClick={handleCopyMessage}
            className="p-1 rounded-md hover:bg-[#FFB6A6]/30 hover:text-[#2D1D19] transition-colors"
            title="Mesajı kopyala"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;