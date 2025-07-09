import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedContent } from '@/types';

/**
 * URL doğrulama fonksiyonu
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Metin temizleme fonksiyonu
 */
const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ') // Birden fazla boşluğu tek boşlukla değiştir
    .replace(/\n+/g, '\n') // Birden fazla satır atlamasını tek satır atlama ile değiştir
    .trim(); // Başındaki ve sonundaki boşlukları temizle
};

/**
 * Metni 1000 karakterlik parçalara böl
 */
const chunkText = (text: string, chunkSize: number = 1000): string[] => {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    
    // Eğer chunk ortasında bir kelimeyi kestiyse, son boşluğa kadar geri git
    if (endIndex < text.length) {
      const lastSpaceIndex = text.lastIndexOf(' ', endIndex);
      if (lastSpaceIndex > startIndex) {
        endIndex = lastSpaceIndex;
      }
    }
    
    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    startIndex = endIndex + 1;
  }
  
  return chunks;
};

/**
 * Web sayfasından içerik çekme
 */
export const scrapeUrl = async (url: string): Promise<ScrapedContent> => {
  // URL doğrulama
  if (!isValidUrl(url)) {
    throw new Error('Geçersiz URL formatı');
  }

  try {
    // HTTP request gönder
    const response = await axios.get(url, {
      timeout: 10000, // 10 saniye timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    // HTML parse et
    const $ = cheerio.load(response.data);

    // Script ve style tag'lerini kaldır
    $('script, style, nav, header, footer, aside').remove();

    // Başlık çek
    const title = $('title').text() || $('h1').first().text() || 'Başlık bulunamadı';

    // Ana içeriği çek - önce article, main, content div'lerini ara
    let content = '';
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '.main-content'
    ];

    let foundContent = false;
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        foundContent = true;
        break;
      }
    }

    // Eğer özel content alanı bulunamazsa body'den çek
    if (!foundContent) {
      content = $('body').text();
    }

    // Metni temizle
    const cleanedContent = cleanText(content);
    
    if (cleanedContent.length < 100) {
      throw new Error('Sayfa içeriği çok kısa veya boş');
    }

    // Metni parçalara böl
    const chunks = chunkText(cleanedContent);

    return {
      url,
      title: cleanText(title),
      content: cleanedContent,
      chunks,
      timestamp: new Date(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Sayfa yükleme süresi aşıldı');
      }
      if (error.response?.status === 404) {
        throw new Error('Sayfa bulunamadı (404)');
      }
      if (error.response?.status === 403) {
        throw new Error('Sayfaya erişim engellendi (403)');
      }
      throw new Error(`HTTP Hatası: ${error.response?.status || 'Bilinmeyen'}`);
    }
    
    throw error;
  }
}; 