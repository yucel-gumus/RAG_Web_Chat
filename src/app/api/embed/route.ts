import { NextRequest, NextResponse } from 'next/server';
import { generateBatchEmbeddings } from '@/lib/gemini';
import { upsertVectors, deleteVectorsByUrl } from '@/lib/pinecone';
import { ScrapedContent, DocumentMetadata } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Request body'yi parse et
    const body = await request.json();
    const { content } = body as { content: ScrapedContent };

    // Content parametresi kontrolü
    if (!content || !content.url || !content.chunks || content.chunks.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli content parametresi gerekli' },
        { status: 400 }
      );
    }

    // Önce o URL'e ait eski vektörleri sil
    try {
      await deleteVectorsByUrl(content.url);
    } catch (error) {
      console.warn('Eski vektörler silinirken hata:', error);
      // Devam et, bu kritik değil
    }

    // Chunk'lar için embeddings oluştur
    console.log(`${content.chunks.length} chunk için embedding oluşturuluyor...`);
    const embeddings = await generateBatchEmbeddings(content.chunks);

    // Metadata array'ini hazırla
    const metadata: DocumentMetadata[] = content.chunks.map((chunk, index) => ({
      url: content.url,
      title: content.title,
      timestamp: typeof content.timestamp === 'string' 
        ? content.timestamp 
        : new Date(content.timestamp).toISOString(),
      chunkIndex: index,
      totalChunks: content.chunks.length,
      content: chunk, // Chunk içeriğini de metadata'ya ekle
    }));

    // Pinecone'a kaydet
    await upsertVectors(embeddings, metadata);

    // Vector ID oluştur (URL'den)
    const vectorId = Buffer.from(content.url).toString('base64');

    return NextResponse.json({
      success: true,
      vectorId,
      chunksProcessed: content.chunks.length,
      message: 'Döküman başarıyla vektör veritabanına kaydedildi',
    });
  } catch (error) {
    console.error('Embedding hatası:', error);
    
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