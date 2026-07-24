import React, { useState } from 'react';
import { Link, Plus, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface UrlInputProps {
  onUrlSubmit: (url: string) => void;
  loading?: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onUrlSubmit, loading = false }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('URL alanı boş bırakılamaz.');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Geçerli bir URL girin (http:// veya https:// ile başlamalı)');
      return;
    }

    setError('');
    onUrlSubmit(url.trim());
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Card className="bg-[#FFB6A6]/20 border-[#FFB6A6]">
      <Card.Header>
        <Card.Title className="flex items-center gap-2 text-[#2D1D19]">
          <div className="p-1.5 bg-[#9BCEC1] rounded-lg border border-[#86BBAE]">
            <Link className="h-4 w-4 text-[#11342C]" />
          </div>
          Web Sayfası URL Ekle
        </Card.Title>
      </Card.Header>

      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={handleUrlChange}
            error={error}
            helperText="Web sayfasının içeriği taranacak, bölünecek ve vektör veritabanına işlenecektir."
            disabled={loading}
          />

          <Button
            type="submit"
            loading={loading}
            disabled={!url.trim() || loading}
            className="w-full shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'İçerik Çekiliyor...' : 'İçeriği Çek ve Veritabanına Kaydet'}
          </Button>
        </form>
      </Card.Content>
    </Card>
  );
};

interface ProcessingStatus {
  step: 'scraping' | 'embedding' | 'success' | 'error';
  message: string;
  url?: string;
}

interface UrlProcessingProps {
  status: ProcessingStatus;
}

const UrlProcessing: React.FC<UrlProcessingProps> = ({ status }) => {
  const getStepIcon = () => {
    switch (status.step) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-[#11342C]" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-[#2D1D19]" />;
      default:
        return (
          <div className="animate-spin h-5 w-5 border-2 border-[#11342C] border-t-transparent rounded-full" />
        );
    }
  };

  const getStepColor = () => {
    switch (status.step) {
      case 'success':
        return 'text-[#11342C] bg-[#9BCEC1]/40 border-[#9BCEC1]';
      case 'error':
        return 'text-[#2D1D19] bg-[#E69B8B]/40 border-[#E69B8B]';
      default:
        return 'text-[#2D1D19] bg-[#FFB6A6]/40 border-[#FFB6A6]';
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${getStepColor()}`}>
      {getStepIcon()}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">
          {status.message}
        </p>
        {status.url && (
          <p className="text-xs opacity-80 truncate mt-0.5">
            {status.url}
          </p>
        )}
      </div>
    </div>
  );
};

export { UrlProcessing };

export default Object.assign(UrlInput, {
  Processing: UrlProcessing,
});