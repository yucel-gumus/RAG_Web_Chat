import { Pinecone } from '@pinecone-database/pinecone';
import { DocumentMetadata } from '@/types';

// Pinecone client'ı başlat
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Index referansını al
const getIndex = () => {
  const indexName = process.env.PINECONE_INDEX_NAME!;
  return pinecone.index(indexName);
};

/**
 * Vector ID oluştur
 */
const generateVectorId = (url: string, chunkIndex: number): string => {
  // URL'yi base64'e çevir ve chunk index'i ekle
  const urlBase64 = Buffer.from(url).toString('base64');
  return `${urlBase64}_chunk_${chunkIndex}`;
};

/**
 * Vektörleri Pinecone'a kaydet
 */
export const upsertVectors = async (
  embeddings: number[][],
  metadata: DocumentMetadata[]
): Promise<void> => {
  try {
    const index = getIndex();
    
    // Vectors array'ini hazırla
    const vectors = embeddings.map((embedding, i) => ({
      id: generateVectorId(metadata[i].url, metadata[i].chunkIndex),
      values: embedding,
      metadata: metadata[i],
    }));

    // Batch halinde kaydet (maksimum 100 vector per batch)
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
    }

    console.log(`${vectors.length} vektör başarıyla Pinecone'a kaydedildi`);
  } catch (error) {
    console.error('Pinecone upsert hatası:', error);
    throw new Error('Vektörler kaydedilemedi');
  }
};

/**
 * Benzer vektörleri ara
 */
export const queryVectors = async (
  queryEmbedding: number[],
  topK: number = 10 // Daha fazla sonuç al
): Promise<{
  matches: Array<{
    id: string;
    score: number;
    metadata: DocumentMetadata;
  }>;
}> => {
  try {
    const index = getIndex();
    
    console.log('🔍 Pinecone query başlatılıyor...');
    console.log('Query vector dimensions:', queryEmbedding.length);
    console.log('TopK:', topK);
    
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      // Namespace belirtmiyoruz - tüm namespace'lerde ara
    });

    console.log('📊 Query Response Details:');
    console.log('Total matches found:', queryResponse.matches?.length || 0);
    
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      queryResponse.matches.forEach((match, index) => {
        console.log(`Match ${index + 1}:`);
        console.log('  ID:', match.id);
        console.log('  Score:', match.score);
        console.log('  Metadata:', match.metadata);
        
        // ID pattern analizi
        if (match.id?.includes('_chunk_')) {
          console.log('  Type: URL-based (current app format)');
        } else {
          console.log('  Type: Possibly PDF-based (different format)');
        }
      });
    }

    return {
      matches: queryResponse.matches?.map(match => ({
        id: match.id || '',
        score: match.score || 0,
        metadata: match.metadata as unknown as DocumentMetadata,
      })) || [],
    };
  } catch (error) {
    console.error('Pinecone query hatası:', error);
    throw new Error('Vektör araması yapılamadı');
  }
};

/**
 * URL'e ait tüm vektörleri sil
 */
export const deleteVectorsByUrl = async (url: string): Promise<void> => {
  try {
    const index = getIndex();
    
    // URL için tüm vector ID'leri oluştur (max 1000 chunk varsayalım)
    const vectorIds: string[] = [];
    for (let i = 0; i < 1000; i++) {
      vectorIds.push(generateVectorId(url, i));
    }

    // Batch halinde sil
    const batchSize = 100;
    for (let i = 0; i < vectorIds.length; i += batchSize) {
      const batch = vectorIds.slice(i, i + batchSize);
      try {
        await index.deleteMany(batch);
      } catch (error) {
        // Silme hataları sessizce göz ardı et (vector yoksa zaten hata verir)
        console.warn(`Batch ${i}-${i + batchSize} silme hatası:`, error);
      }
    }

    console.log(`URL ${url} için vektörler silindi`);
  } catch (error) {
    console.error('Pinecone delete hatası:', error);
    throw new Error('Vektörler silinemedi');
  }
};

/**
 * Index istatistiklerini al
 */
export const getIndexStats = async () => {
  try {
    const index = getIndex();
    const stats = await index.describeIndexStats();
    
    console.log('📈 Pinecone Index Stats:');
    console.log('Total record count:', stats.totalRecordCount);
    console.log('Dimension:', stats.dimension);
    console.log('Index fullness:', stats.indexFullness);
    
    if (stats.namespaces) {
      console.log('📋 Namespaces:');
      Object.entries(stats.namespaces).forEach(([namespace, data]) => {
        console.log(`  ${namespace || 'default'}:`, data.recordCount, 'records');
      });
    } else {
      console.log('No namespace information available');
    }
    
    return stats;
  } catch (error) {
    console.error('Pinecone stats hatası:', error);
    throw new Error('Index istatistikleri alınamadı');
  }
}; 