'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Database, PlusCircle, Trash2, Globe, Layers, Sparkles } from 'lucide-react';
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
  const sessionChunkTotal = documents.reduce((sum, d) => sum + d.chunksCount, 0);

  useEffect(() => {
    fetch('/api/session', { credentials: 'include' }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const savedDocuments = localStorage.getItem('rag-web-chat-documents');
    if (savedDocuments) {
      try {
        const parsed = JSON.parse(savedDocuments);
        setDocuments(
          parsed.map((doc: ProcessedWebsite) => ({
            ...doc,
            timestamp: new Date(doc.timestamp),
          }))
        );
      } catch (error) {
        console.error('localStorage parse error:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('rag-web-chat-documents', JSON.stringify(documents));
    }
  }, [documents]);

  const handleUrlSubmit = async (url: string) => {
    setLoading(true);
    setProcessing({ step: 'scraping', message: 'Web sayfası içeriği taranıyor...', url });
    try {
      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!scrapeResponse.ok)
        throw new Error((await scrapeResponse.json()).error || 'Scraping başarısız');

      const scrapeData = await scrapeResponse.json();
      const scrapedContent = scrapeData.data;

      setProcessing({
        step: 'embedding',
        message: 'İçerik işleniyor ve vektör veritabanına kaydediliyor...',
        url,
      });

      const embedResponse = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: scrapedContent }),
      });
      if (!embedResponse.ok)
        throw new Error((await embedResponse.json()).error || 'Embedding başarısız');

      const embedData = await embedResponse.json();
      setProcessing({
        step: 'success',
        message: `Başarıyla kaydedildi! ${embedData.chunksProcessed} parça işlendi.`,
        url,
      });

      const newDocument: ProcessedWebsite = {
        url: scrapedContent.url,
        title: scrapedContent.title,
        chunksCount: embedData.chunksProcessed,
        timestamp: new Date(),
        vectorId: embedData.vectorId,
      };
      setDocuments(prev => [newDocument, ...prev]);

      setTimeout(() => setProcessing(null), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bilinmeyen hata oluştu';
      setProcessing({ step: 'error', message, url });
      setTimeout(() => setProcessing(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebsite = async (url: string) => {
    const updatedDocs = documents.filter(doc => doc.url !== url);
    setDocuments(updatedDocs);

    if (updatedDocs.length === 0) {
      localStorage.removeItem('rag-web-chat-documents');
    } else {
      localStorage.setItem('rag-web-chat-documents', JSON.stringify(updatedDocs));
    }

    try {
      await fetch('/api/embed', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="h-screen bg-[#FFEBD3] text-[#2D1D19] flex flex-col overflow-hidden font-sans">
      {/* Navbar (30% Surface Accent #FFB6A6) */}
      <header className="bg-[#FFB6A6] border-b border-[#EFA696] px-6 py-3.5 shadow-xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="bg-[#9BCEC1] p-2.5 rounded-2xl border border-[#86BBAE] shadow-xs">
              <MessageCircle className="h-6 w-6 text-[#11342C]" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#2D1D19] tracking-tight flex items-center gap-2">
                RAG Web Sohbet
                <span className="text-xs bg-[#9BCEC1] text-[#11342C] px-2 py-0.5 rounded-full font-bold">
                  PRO
                </span>
              </h1>
              <p className="text-xs text-[#5D433E]">
                Web sitelerinin içeriğini vektör veritabanına aktarıp yapay zekaya öğretin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              className="shadow-sm font-bold"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Web Sitesi Ekle
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Saved Sites (30% Surface #FFB6A6) */}
        <aside className="w-80 bg-[#FFB6A6]/40 border-r border-[#FFB6A6] flex flex-col shadow-xs">
          <div className="p-4 border-b border-[#FFB6A6] flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#2D1D19] uppercase tracking-wider">
              <Database className="h-4 w-4 text-[#11342C]" />
              Kaydedilen Siteler ({documents.length})
            </h2>
            <span className="text-xs bg-[#9BCEC1] text-[#11342C] px-2 py-0.5 rounded-lg font-bold">
              {sessionChunkTotal} Parça
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {documents.length === 0 ? (
              <div className="p-6 text-center text-[#5D433E]">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50 text-[#856761]" />
                <p className="text-sm font-medium">Henüz web sitesi eklenmedi</p>
                <p className="text-xs mt-1 text-[#856761]">
                  AI ile sohbet etmeye başlamak için üstteki butonla web sitesi ekleyin.
                </p>
              </div>
            ) : (
              documents.map((doc, index) => (
                <div
                  key={index}
                  className="group flex items-start justify-between p-3 bg-[#FFF7ED] rounded-xl border border-[#FFB6A6] hover:border-[#9BCEC1] transition-all shadow-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-semibold text-[#2D1D19] truncate text-xs">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-[#5D433E] truncate mt-0.5">{doc.url}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#856761]">
                      <span className="bg-[#9BCEC1]/40 text-[#11342C] px-1.5 py-0.5 rounded-md font-medium">
                        {doc.chunksCount} parça
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteWebsite(doc.url)}
                    className="p-1.5 text-[#856761] hover:text-[#2D1D19] hover:bg-[#E69B8B]/40 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Content Area (60% Canvas #FFEBD3) */}
        <main className="flex-1 flex flex-col overflow-hidden p-6 bg-[#FFEBD3]">
          <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full bg-[#FFF7ED] rounded-3xl shadow-sm border border-[#FFB6A6]">
            <ChatContainer canChat={documents.length > 0} />
          </div>
        </main>
      </div>

      {/* Modal Dialog */}
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
                  <Layers className="h-5 w-5 text-[#11342C]" />
                  Bu Oturumda Kaydedilen Siteler ({documents.length})
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#FFF7ED] rounded-xl border border-[#FFB6A6]"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-semibold text-xs text-[#2D1D19] truncate">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-[#5D433E] truncate">{doc.url}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteWebsite(doc.url)}
                        className="p-1.5 text-[#856761] hover:text-[#2D1D19] rounded-lg hover:bg-[#E69B8B]/30"
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
                <Sparkles className="h-5 w-5 text-[#11342C]" />
                Veritabanı ve Oturum Bilgisi
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-xs text-[#5D433E] leading-relaxed">
                Bu oturumda toplam <strong className="text-[#2D1D19]">{sessionChunkTotal}</strong>{' '}
                parça ({documents.length} site) işlendi. Yapay zeka sorguları doğrudan bu vektör
                veritabanı parçaları üzerinden yanıtlar üretecektir.
              </p>
            </Card.Content>
          </Card>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
