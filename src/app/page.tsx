'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Database, FileText, Trash2 } from 'lucide-react';
import UrlInput from '@/components/url-input/UrlInput';
import ChatContainer from '@/components/chat/ChatContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
// LocalStorage removed - using only Pinecone stats

interface ProcessedWebsite {
  url: string;
  title: string;
  chunksCount: number;
  timestamp: Date;
  vectorId?: string;
}

const HomePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<{
    step: 'scraping' | 'embedding' | 'success' | 'error';
    message: string;
    url?: string;
  } | null>(null);
  const [documents, setDocuments] = useState<ProcessedWebsite[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [pineconeStats, setPineconeStats] = useState<{
    totalVectors: number;
    loading: boolean;
  }>({ totalVectors: 0, loading: true });

  // Load Pinecone stats
  useEffect(() => {
    const loadPineconeStats = async () => {
      try {
        const response = await fetch('/api/documents');
        const data = await response.json();
        setPineconeStats({
          totalVectors: data.totalVectors || 0,
          loading: false,
        });
        console.log('Pinecone stats:', data);
      } catch (error) {
        console.error('Pinecone stats error:', error);
        setPineconeStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadPineconeStats();
  }, []);

  const handleUrlSubmit = async (url: string) => {
    setLoading(true);
    setProcessing({
      step: 'scraping',
      message: 'Web sayfası içeriği çekiliyor...',
      url,
    });

    try {
      // 1. Web scraping
      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!scrapeResponse.ok) {
        const error = await scrapeResponse.json();
        throw new Error(error.error || 'Scraping başarısız');
      }

      const scrapeData = await scrapeResponse.json();
      const scrapedContent = scrapeData.data;

      // 2. Embedding ve kaydetme
      setProcessing({
        step: 'embedding',
        message: 'İçerik işleniyor ve vektör veritabanına kaydediliyor...',
        url,
      });

      const embedResponse = await fetch('/api/embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: scrapedContent }),
      });

      if (!embedResponse.ok) {
        const error = await embedResponse.json();
        throw new Error(error.error || 'Embedding başarısız');
      }

      const embedData = await embedResponse.json();

      // Başarılı
      setProcessing({
        step: 'success',
        message: `Başarıyla kaydedildi! ${embedData.chunksProcessed} parça işlendi.`,
        url,
      });

      // Web sitesi listesine ekle (session için)
      const newDocument: ProcessedWebsite = {
        url: scrapedContent.url,
        title: scrapedContent.title,
        chunksCount: embedData.chunksProcessed,
        timestamp: new Date(),
        vectorId: embedData.vectorId,
      };

      setDocuments(prev => [newDocument, ...prev]);
      
      // Pinecone stats'ları yenile
      const response = await fetch('/api/documents');
      const data = await response.json();
      setPineconeStats({
        totalVectors: data.totalVectors || 0,
        loading: false,
      });

      // 3 saniye sonra processing'i temizle
      setTimeout(() => {
        setProcessing(null);
      }, 3000);

    } catch (error) {
      console.error('Hata:', error);
      setProcessing({
        step: 'error',
        message: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu',
        url,
      });

      // 5 saniye sonra error'u temizle
      setTimeout(() => {
        setProcessing(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChat = () => {
    setShowChat(!showChat);
  };

  const handleDeleteWebsite = async (url: string) => {
    try {
      // UI'dan sil (session için)
      setDocuments(prev => prev.filter(doc => doc.url !== url));
      
      // İsteğe bağlı: Pinecone'dan da silebilir (API call gerekir)
      // await fetch('/api/documents/delete', { ... });
      
    } catch (error) {
      console.error('Web sitesi silme hatası:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Web Sitesi Sohbet Uygulaması
                </h1>
                <p className="text-gray-600">
                  Web sitelerinin bilgilerini AI&apos;ya öğreterek sohbet edin
                </p>
              </div>
            </div>
            
            {(documents.length > 0 || pineconeStats.totalVectors > 0) && (
              <Button onClick={handleToggleChat}>
                <MessageCircle className="h-4 w-4 mr-2" />
                {showChat ? 'Web Sitesi Ekle' : 'Sohbet Et'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!showChat ? (
          <div className="space-y-6">
            {/* URL Input */}
            <UrlInput onUrlSubmit={handleUrlSubmit} loading={loading} />

            {/* Processing Status */}
            {processing && (
              <UrlInput.Processing status={processing} />
            )}

            {/* Documents List */}
            {documents.length > 0 && (
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-600" />
                    Kaydedilmiş Web Siteleri ({documents.length})
                  </Card.Title>
                </Card.Header>
                
                <Card.Content>
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 line-clamp-1">
                            {doc.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                            {doc.url}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.chunksCount} parça • {new Intl.DateTimeFormat('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                            }).format(doc.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Aktif</span>
                          <button
                            onClick={() => handleDeleteWebsite(doc.url)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Web sitesini sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* Pinecone Stats */}
            {(
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Pinecone Veritabanı Durumu
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  {pineconeStats.loading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      Pinecone stats yükleniyor...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Toplam Vektör:</span> {pineconeStats.totalVectors}
                      </p>
                      {pineconeStats.totalVectors > 0 ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-800">
                            ✅ Pinecone&apos;da {pineconeStats.totalVectors} vektör bulundu! 
                            Chat&apos;i açarak sorular sorabilirsiniz.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-sm text-orange-800">
                            ⚠️ Pinecone&apos;da henüz vektör bulunamadı. 
                            Yukarıdan bir URL ekleyerek başlayın.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Empty State */}
            {documents.length === 0 && !processing && pineconeStats.totalVectors === 0 && (
              <Card className="text-center py-12">
                <Card.Content>
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Henüz web sitesi eklenmedi
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Başlamak için yukarıdaki forma bir web sitesi URL&apos;si girin
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• Blog yazıları ve makaleler</p>
                    <p>• Dokümantasyon sayfaları</p>
                    <p>• Haber siteleri</p>
                    <p>• Akademik yayınlar</p>
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>
        ) : (
          <div className="h-[calc(100vh-180px)]">
            <ChatContainer onBack={() => setShowChat(false)} />
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
