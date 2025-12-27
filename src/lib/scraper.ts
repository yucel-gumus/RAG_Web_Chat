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
const chunkText = (text: string, chunkSize: number = 2000, overlap: number = 400): string[] => {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

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

    startIndex = endIndex - overlap;
    if (startIndex < 0) startIndex = 0;
    if (startIndex >= text.length) break;
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
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);

    $('script, style, noscript, iframe, svg, nav, footer').remove();

    const title = $('title').text() || $('h1').first().text() || 'Başlık bulunamadı';

    const contentParts: string[] = [];
    const seenTexts = new Set<string>();

    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 0 && !seenTexts.has(text)) {
        seenTexts.add(text);
        contentParts.push(`## ${text}`);
      }
    });

    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30 && !seenTexts.has(text)) {
        seenTexts.add(text);
        contentParts.push(text);
      }
    });

    $('li').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 20 && text.length < 500 && !seenTexts.has(text)) {
        seenTexts.add(text);
        contentParts.push(`- ${text}`);
      }
    });

    $('dd').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30 && !seenTexts.has(text)) {
        seenTexts.add(text);
        contentParts.push(text);
      }
    });

    let content = contentParts.join('\n\n');

    if (content.length < 200) {
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
        const blockedSites = ['medium.com', 'linkedin.com', 'facebook.com', 'twitter.com'];
        const isKnownBlocked = blockedSites.some(site => url.includes(site));
        if (isKnownBlocked) {
          throw new Error('Bu site bot koruması nedeniyle erişimi engelliyor. Lütfen farklı bir kaynak deneyin.');
        }
        throw new Error('Sayfaya erişim engellendi (403). Site bot koruması kullanıyor olabilir.');
      }
      throw new Error(`HTTP Hatası: ${error.response?.status || 'Bilinmeyen'}`);
    }

    throw error;
  }
}; 