import { NextRequest, NextResponse } from 'next/server';
import { gatewayFetch } from '@/lib/gateway';
import { ScrapedContent } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body as { content: ScrapedContent };

    if (!content?.url || !content.chunks?.length) {
      return NextResponse.json({ error: 'Geçerli content gerekli' }, { status: 400 });
    }

    const response = await gatewayFetch('/api/rag-web/upsert', {
      method: 'POST',
      admin: true,
      body: JSON.stringify({ content }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Embedding hatası', success: false },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      vectorId: data.vectorId,
      chunksProcessed: data.chunksProcessed,
      message: data.message,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Bilinmeyen hata', success: false },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body as { url: string };

    if (!url) {
      return NextResponse.json({ error: 'URL gerekli' }, { status: 400 });
    }

    const response = await gatewayFetch('/api/rag-web/delete', {
      method: 'POST',
      admin: true,
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Silme hatası', success: false },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, message: data.message });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Silme hatası', success: false },
      { status: 500 },
    );
  }
}