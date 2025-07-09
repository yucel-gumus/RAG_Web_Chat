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
    
    // URL doğrulama
    if (!url.trim()) {
      setError('URL gerekli');
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
    <Card>
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          <Link className="h-5 w-5 text-blue-600" />
          URL Ekle
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
            helperText="Web sayfasının URL'sini girin. İçerik çekilip vektör veritabanına kaydedilecek."
            disabled={loading}
          />
          
          <Button 
            type="submit" 
            loading={loading}
            disabled={!url.trim() || loading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'İşleniyor...' : 'Çek ve Kaydet'}
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
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return (
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
        );
    }
  };

  const getStepColor = () => {
    switch (status.step) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStepColor()}`}>
      {getStepIcon()}
      <div className="flex-1">
        <p className="font-medium">
          {status.message}
        </p>
        {status.url && (
          <p className="text-sm opacity-75 mt-1">
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