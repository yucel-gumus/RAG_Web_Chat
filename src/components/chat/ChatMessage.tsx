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
        flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs border transition-colors duration-200
        ${isUser
          ? 'bg-[#F2A488] text-[#253341] border-[#EC7D55]/60'
          : 'bg-[#DCE3EA] text-[#253341] border-[#BCC7D2]'
        }
      `}
      >
        {isUser ? <User className="h-4 w-4 stroke-[2.5]" /> : <Bot className="h-4 w-4 stroke-[2.5]" />}
      </div>

      {/* Message Body */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`
          inline-block p-4 rounded-2xl shadow-xs border transition-all duration-200 text-sm leading-relaxed
          ${isUser
            ? 'bg-[#F2A488]/45 text-[#253341] border-[#EC7D55]/60 font-medium rounded-tr-xs'
            : 'bg-[#DCE3EA] text-[#253341] border-[#BCC7D2] rounded-tl-xs'
          }
        `}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-[#BCC7D2] text-left">
              <p className="text-xs font-semibold text-[#3E5164] uppercase tracking-wider mb-2">Kaynaklar:</p>
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
                      className="inline-flex items-center gap-1.5 text-xs text-[#253341] bg-[#F5F9F5] px-2.5 py-1 rounded-lg border border-[#BCC7D2] hover:bg-[#DBE6DD] hover:border-[#EC7D55] transition-colors duration-200"
                    >
                      <ExternalLink className="h-3 w-3 text-[#3E5164]" />
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
          flex items-center gap-2 mt-1.5 text-xs text-[#3E5164] px-1
          ${isUser ? 'justify-end' : 'justify-start'}
        `}
        >
          <span>{formatTime(message.timestamp)}</span>
          <button
            onClick={handleCopyMessage}
            className="p-1 rounded-md hover:bg-[#DBE6DD] hover:text-[#253341] transition-colors duration-200"
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