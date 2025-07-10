'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Database, PlusCircle, Trash2 } from 'lucide-react';
import ChatContainer from '@/components/chat/ChatContainer';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import UrlInput from '@/components/url-input/UrlInput';
import Card from '@/components/ui/Card';

interface ProcessedWebsite {
  url: string;
  title: string;
  chunksCount: number;
  timestamp: Date;
  vectorId?: string;
}

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<{
    step: 'scraping' | 'embedding' | 'success' | 'error';
    message: string;
    url?: string;
  } | null>(null);
  const [documents, setDocuments] = useState<ProcessedWebsite[]>([]);
  const [pineconeStats, setPineconeStats] = useState<{
    totalVectors: number;
    loading: boolean;
  }>({ totalVectors: 0, loading: true });

  useEffect(() => {
    const loadPineconeStats = async () => {
      try {
        const response = await fetch('/api/documents');
        const data = await response.json();
        setPineconeStats({
          totalVectors: data.totalVectors || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Pinecone stats error:', error);
        setPineconeStats(prev => ({ ...prev, loading: false }));
      }
    };
    loadPineconeStats();
  }, []);

  const handleUrlSubmit = async (url: string) => {
    setLoading(true);
    setProcessing({ step: 'scraping', message: 'Web sayfası içeriği çekiliyor...', url });
    try {
      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!scrapeResponse.ok) throw new Error((await scrapeResponse.json()).error || 'Scraping başarısız');
      
      const scrapeData = await scrapeResponse.json();
      const scrapedContent = scrapeData.data;

      setProcessing({ step: 'embedding', message: 'İçerik işleniyor ve vektör veritabanına kaydediliyor...', url });
      
      const embedResponse = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: scrapedContent }),
      });
      if (!embedResponse.ok) throw new Error((await embedResponse.json()).error || 'Embedding başarısız');

      const embedData = await embedResponse.json();
      setProcessing({ step: 'success', message: `Başarıyla kaydedildi! ${embedData.chunksProcessed} parça işlendi.`, url });

      const newDocument: ProcessedWebsite = {
        url: scrapedContent.url,
        title: scrapedContent.title,
        chunksCount: embedData.chunksProcessed,
        timestamp: new Date(),
        vectorId: embedData.vectorId,
      };
      setDocuments(prev => [newDocument, ...prev]);

      const statsResponse = await fetch('/api/documents');
      const statsData = await statsResponse.json();
      setPineconeStats({ totalVectors: statsData.totalVectors || 0, loading: false });
      
      setTimeout(() => setProcessing(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bilinmeyen hata oluştu';
      setProcessing({ step: 'error', message, url });
      setTimeout(() => setProcessing(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebsite = (url: string) => {
    setDocuments(prev => prev.filter(doc => doc.url !== url));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Web Sitesi Sohbet Uygulaması</h1>
                <p className="text-gray-600">Web sitelerinin bilgilerini AI&apos;ya öğreterek sohbet edin</p>
              </div>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Web Sitesi Ekle
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 flex-grow w-full">
        <ChatContainer />
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Web Sitesi Ekle"
      >
        <div className="space-y-6">
          <UrlInput onUrlSubmit={handleUrlSubmit} loading={loading} />
          {processing && <UrlInput.Processing status={processing} />}
          {documents.length > 0 && (
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  Bu Oturumda Kaydedilenler ({documents.length})
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">{doc.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-1 mt-1">{doc.url}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {doc.chunksCount} parça • {new Intl.DateTimeFormat('tr-TR').format(doc.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteWebsite(doc.url)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          )}
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Veritabanı Durumu
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {pineconeStats.loading ? (
                <p>Yükleniyor...</p>
              ) : (
                <p>Toplam {pineconeStats.totalVectors} vektör kayıtlı.</p>
              )}
            </Card.Content>
          </Card>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
