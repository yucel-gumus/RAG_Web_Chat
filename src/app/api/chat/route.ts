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

    console.log('Kullanıcı sorusu:', message);

    // 1. Soru için embedding oluştur
    const queryEmbedding = await generateQueryEmbedding(message);
    console.log('Query embedding oluşturuldu');

    // 2. Pinecone'dan benzer vektörleri ara
    const searchResults = await queryVectors(queryEmbedding, 10);
    console.log(`${searchResults.matches.length} eşleşme bulundu`);

    // 3. Context'i oluştur
    let context = '';
    const sources: string[] = [];
    const sourceMapping: { [key: number]: string } = {}; // Bölüm numarası -> kaynak mapping
    
    if (searchResults.matches.length > 0) {
      console.log('🔍 Tüm matches (skor sırasına göre):');
      searchResults.matches.forEach((match, index) => {
        console.log(`${index + 1}. Score: ${match.score}, ID: ${match.id}`);
      });
      
      // Benzerlik skorunu düşür - PDF veriler için
      const relevantMatches = searchResults.matches
        .filter(match => match.score > 0.5) // Daha düşük threshold
        .slice(0, 5); // Daha fazla chunk al
      
      console.log(`📝 Relevantmatches (>0.5 score): ${relevantMatches.length}`);
      relevantMatches.forEach((match, index) => {
        console.log(`${index + 1}. Score: ${match.score}, Source type: ${match.id?.includes('_chunk_') ? 'URL' : 'PDF?'}`);
      });

              if (relevantMatches.length > 0) {
        const contextParts: string[] = [];
        
        relevantMatches.forEach((match, index) => {
          // PDF (metin) ve URL (content/text) verilerini handle et
          const content = match.metadata.content || 
                        match.metadata.text || 
                        match.metadata.metin || 
                        'İçerik bulunamadı';
          
          console.log(`📝 Content extracted (${content.length} chars):`, content.substring(0, 100) + '...');
          
          // Source belirleme - URL vs PDF
          let source = '';
          if (match.metadata.url) {
            source = `${match.metadata.title || 'Web Dökümanı'} (${match.metadata.url})`;
          } else if (match.metadata.filename || match.metadata.file_name) {
            source = `${match.metadata.filename || match.metadata.file_name} (PDF)`;
          } else if (match.metadata.dosyaId) {
            // PDF dosyası (UUID format)
            const title = match.metadata.metin?.substring(0, 50) + '...' || 'PDF Dökümanı';
            source = `${title} (PDF - ${match.metadata.dosyaId.substring(0, 8)})`;
          } else if (match.metadata.title) {
            source = `${match.metadata.title} (Döküman)`;
          } else {
            source = `Döküman (${match.id.substring(0, 8)}...)`;
          }
          
          console.log('📄 Source detected:', source);
          
          // Numaralı bölüm oluştur
          const sectionNumber = index + 1;
          contextParts.push(`BÖLÜM ${sectionNumber}:\n${content}`);
          sourceMapping[sectionNumber] = source;
        });
        
        context = contextParts.join('\n\n---\n\n');
        
        console.log('Context oluşturuldu, bölüm sayısı:', contextParts.length);
        console.log('📚 Source Mapping:', sourceMapping);
      }
    }

    // 4. Context varsa AI'dan cevap al, yoksa açıklayıcı mesaj
    let aiResponse: string;
    
    if (context.trim().length === 0) {
      aiResponse = `Üzgünüm, bu soruya cevap verebilmek için gerekli bilgileri vektör veritabanımda bulamadım. 

Lütfen önce ilgili web sayfalarını ekleyerek döküman veritabanını oluşturun. Ardından bu sorularınızı yeniden sorabilirsiniz.

Ekleyebileceğiniz içerik türleri:
- Blog yazıları
- Dokümantasyon sayfaları
- Haber makaleleri
- Akademik yayınlar
- Teknik rehberler`;
    } else {
      aiResponse = await generateChatResponse(message, context);
      
      // AI'ın kullandığı bölüm numaralarını çıkar
      const usedSectionsMatch = aiResponse.match(/KULLANILAN BÖLÜMLER:\s*([0-9,\s]+)/);
      if (usedSectionsMatch && typeof sourceMapping !== 'undefined') {
        const usedSectionNumbers = usedSectionsMatch[1]
          .split(',')
          .map(num => parseInt(num.trim()))
          .filter(num => !isNaN(num));
        
        console.log('🎯 AI kullandığı bölümler:', usedSectionNumbers);
        
        // Sadece kullanılan kaynakları sources'a ekle
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
    console.error('Chat hatası:', error);
    
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