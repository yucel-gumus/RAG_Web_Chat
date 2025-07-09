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
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
        ${isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-200 text-gray-700'
        }
      `}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`
          inline-block max-w-[80%] p-3 rounded-lg
          ${isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-white border border-gray-200 text-gray-900'
          }
        `}>
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {/* Sources */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Kaynaklar:</p>
              <div className="space-y-1">
                {message.sources.map((source, index) => {
                  const [title, url] = source.includes('(') && source.includes(')')
                    ? [source.split('(')[0].trim(), source.split('(')[1].replace(')', '')]
                    : [source, source];
                  
                  return (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate">{title}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Message Footer */}
        <div className={`
          flex items-center gap-2 mt-1 text-xs text-gray-500
          ${isUser ? 'justify-end' : 'justify-start'}
        `}>
          <span>{formatTime(message.timestamp)}</span>
          <button
            onClick={handleCopyMessage}
            className="hover:text-gray-700 transition-colors"
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