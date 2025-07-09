import { NextRequest, NextResponse } from 'next/server';
import { generateQueryEmbedding, generateChatResponse } from '@/lib/gemini';
import { queryVectors } from '@/lib/pinecone';
import { ChatRequest, ChatResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Request body'yi parse et
    const body = await request.json();
    const { message, conversationId } = body as ChatRequest;

    // Message parametresi kontrolü
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Geçerli bir mesaj gerekli' },
        { status: 400 }
      );
    }

    // 1. Soru için embedding oluştur
    const queryEmbedding = await generateQueryEmbedding(message);

    // 2. Pinecone'dan benzer vektörleri ara
    const searchResults = await queryVectors(queryEmbedding, 10);

    // 3. Context'i oluştur
    let context = '';
    const sources: string[] = [];
    const sourceMapping: { [key: number]: string } = {};
    
    if (searchResults.matches.length > 0) {
      // Sadece web sitesi içeriklerini işle
      const relevantMatches = searchResults.matches
        .filter(match => match.score > 0.5)
        .slice(0, 5);

      if (relevantMatches.length > 0) {
        const contextParts: string[] = [];
        
        relevantMatches.forEach((match, index) => {
          // Sadece web sitesi içeriği
          const content = String(match.metadata.content || 'İçerik bulunamadı');
          
          // Kaynak sadece URL ve başlık
          let source = '';
          if (match.metadata.url) {
            source = `${match.metadata.title || 'Web Sitesi'} (${match.metadata.url})`;
          } else {
            source = `Web Sitesi (${String(match.id).substring(0, 8)}...)`;
          }
          
          // Numaralı bölüm oluştur
          const sectionNumber = index + 1;
          contextParts.push(`BÖLÜM ${sectionNumber}:
${content}`);
          sourceMapping[sectionNumber] = source;
        });
        
        context = contextParts.join('\n\n---\n\n');
      }
    }

    // 4. Context varsa AI'dan cevap al, yoksa açıklayıcı mesaj
    let aiResponse: string;
    
    if (context.trim().length === 0) {
      aiResponse = `Üzgünüm, bu soruya cevap verebilmek için gerekli bilgileri vektör veritabanımda bulamadım.\n\nLütfen önce ilgili web sitelerini ekleyin. Ardından bu sorularınızı yeniden sorabilirsiniz.`;
    } else {
      aiResponse = await generateChatResponse(message, context);
      // Kaynak eşleştirme
      const usedSectionsMatch = aiResponse.match(/KULLANILAN BÖLÜMLER:\s*([0-9,\s]+)/);
      if (usedSectionsMatch && typeof sourceMapping !== 'undefined') {
        const usedSectionNumbers = usedSectionsMatch[1]
          .split(',')
          .map(num => parseInt(num.trim()))
          .filter(num => !isNaN(num));
        usedSectionNumbers.forEach(sectionNum => {
          if (sourceMapping[sectionNum] && !sources.includes(sourceMapping[sectionNum])) {
            sources.push(sourceMapping[sectionNum]);
          }
        });
        // AI cevabından "KULLANILAN BÖLÜMLER" kısmını temizle
        const cleanupIndex = aiResponse.indexOf('\n\nKULLANILAN BÖLÜMLER:');
        if (cleanupIndex > -1) {
          aiResponse = aiResponse.substring(0, cleanupIndex).trim();
        }
      }
    }

    // 5. Conversation ID oluştur (yoksa)
    const finalConversationId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response: ChatResponse = {
      response: aiResponse,
      sources,
      conversationId: finalConversationId,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata oluştu',
        response: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        sources: [],
        conversationId: ''
      },
      { status: 500 }
    );
  }
}

// OPTIONS metodu CORS için
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 