import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Trash2, ArrowLeft } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Button from '@/components/ui/Button';
import { ChatMessage as ChatMessageType } from '@/types';

interface ChatContainerProps {
  onBack?: () => void;
  allowedUrls: string[];
  canChat: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ onBack, allowedUrls, canChat }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
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
    if (!content.trim() || loading || !canChat || allowedUrls.length === 0) return;

    // Add user message
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
          allowedUrls,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Chat API hatası');
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: ChatMessageType = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        sources: data.sources || [],
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation ID
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }

    } catch (error) {
      // Add error message
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

    // Re-add welcome message
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
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && ( // Conditionally render back button
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

            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Sohbet
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleClearChat}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Temizle
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 min-h-0">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="inline-block bg-white border border-gray-200 text-gray-900 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-gray-600">AI düşünüyor...</span>
                  </div>
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
        placeholder="Web sitelerinden öğrendiğim bilgiler hakkında bir soru sorun..."
      />
    </div>
  );
};

export default ChatContainer; 