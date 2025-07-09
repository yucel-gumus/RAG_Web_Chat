import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    // Request body'yi parse et
    const body = await request.json();
    const { url } = body;

    // URL parametresi kontrolü
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL parametresi gerekli ve string olmalıdır' },
        { status: 400 }
      );
    }

    // Web scraping işlemini gerçekleştir
    const scrapedContent = await scrapeUrl(url);

    return NextResponse.json({
      success: true,
      data: scrapedContent,
    });
  } catch (error) {
    console.error('Scraping hatası:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu',
        success: false 
      },
      { status: 500 }
    );
  }
}

// OPTIONS metodu CORS için
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 