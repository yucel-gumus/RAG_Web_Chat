import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/scraper';
import { assertSafePublicUrl } from '@/lib/ssrf-guard';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL parametresi gerekli ve string olmalıdır' },
        { status: 400 },
      );
    }

    const safeUrl = await assertSafePublicUrl(url);
    const scrapedContent = await scrapeUrl(safeUrl);

    return NextResponse.json({
      success: true,
      data: scrapedContent,
    });
  } catch (error) {
    console.error('Scraping hatası:', error);

    const message = error instanceof Error ? error.message : 'Bilinmeyen hata oluştu';
    const clientError =
      message.includes('kapalı') ||
      message.includes('özel') ||
      message.includes('Geçersiz') ||
      message.includes('http/https') ||
      message.includes('Kimlik');

    return NextResponse.json({ error: message, success: false }, { status: clientError ? 400 : 500 });
  }
}