import { NextRequest, NextResponse } from 'next/server';
import { gatewayFetch } from '@/lib/gateway';
import { ChatRequest, ChatResponse } from '@/types';
import { requireTenantId } from '@/lib/tenant';

export async function POST(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request);
    if (!tenantId) {
      return NextResponse.json({ error: 'Oturum gerekli. Sayfayı yenileyin.' }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId } = body as ChatRequest;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Geçerli bir mesaj gerekli' }, { status: 400 });
    }

    const response = await gatewayFetch('/api/rag-web/chat', {
      method: 'POST',
      body: JSON.stringify({ tenantId, message }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || 'Gateway hatası' },
        { status: response.status },
      );
    }

    const result: ChatResponse = {
      response: data.response,
      sources: data.sources || [],
      conversationId: conversationId || data.conversationId || '',
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        response: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        sources: [],
        conversationId: '',
      },
      { status: 500 },
    );
  }
}