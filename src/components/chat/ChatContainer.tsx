import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Button from '@/components/ui/Button';
import { ChatMessage as ChatMessageType } from '@/types';

interface ChatContainerProps {
  onBack?: () => void;
  canChat: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ onBack, canChat }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const welcomeMessage: ChatMessageType = {
      id: `welcome_${Date.now()}`,
      role: 'assistant',
      content: `Merhaba! 👋 Web sitesi sohbet asistanınızım.\n\nVektör veritabanınıza kaydettiğiniz web sitelerinden öğrendiğim bilgiler hakkında sorular sorabilirsiniz. Size sadece bu web sitelerinin içeriği çerçevesinde yardımcı olabilirim.\n\nNasıl yardımcı olabilirim?`,
      timestamp: new Date(),
      sources: [],
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || loading || !canChat) return;

    const userMessage: ChatMessageType = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationId: conversationId || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Chat API hatası');
      }

      const data = await response.json();

      const assistantMessage: ChatMessageType = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sources: data.sources || [],
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      const errorMessage: ChatMessageType = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `Üzgünüm, bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}\n\nLütfen tekrar deneyin.`,
        timestamp: new Date(),
        sources: [],
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationId('');

    const welcomeMessage: ChatMessageType = {
      id: `welcome_${Date.now()}`,
      role: 'assistant',
      content: `Sohbet temizlendi! 🧹\n\nYeni sorularınızı sorabilirsiniz.`,
      timestamp: new Date(),
      sources: [],
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="h-full flex flex-col bg-[#FFEBD3]">
      {/* Header */}
      <div className="bg-[#FFB6A6]/40 border-b border-[#FFB6A6]/70 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Geri
              </Button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="bg-[#9BCEC1] p-2 rounded-xl border border-[#86BBAE]">
                <MessageCircle className="h-5 w-5 text-[#11342C]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#2D1D19] flex items-center gap-1.5">
                  KENSAI Sohbet Akışı
                  <Sparkles className="h-4 w-4 text-[#5D433E]" />
                </h2>
                <p className="text-xs text-[#5D433E]">
                  {canChat ? 'Vektör Veritabanı Aktif' : 'Lütfen önce web sitesi ekleyin'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearChat}
              className="flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Temizle
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 min-h-0">
        <div className="max-w-4xl mx-auto space-y-5">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-2xl bg-[#FFB6A6] text-[#2D1D19] flex items-center justify-center border border-[#EFA696]">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="bg-[#FFF7ED] border border-[#FFB6A6] p-3.5 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2 text-sm text-[#2D1D19] font-medium">
                  <div className="animate-spin h-4 w-4 border-2 border-[#9BCEC1] border-t-transparent rounded-full"></div>
                  <span>KENSAI web sitelerini tarıyor ve anlıyor...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        loading={loading}
        disabled={!canChat}
        placeholder={
          canChat
            ? 'Web sitelerinden öğrendiğim bilgiler hakkında soru sorun...'
            : 'Sohbet etmek için lütfen sol panelden bir web sitesi ekleyin.'
        }
      />
    </div>
  );
};

export default ChatContainer;