import { GoogleGenerativeAI } from '@google/generative-ai';

// Google AI client'ı başlat
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

/**
 * Embedding oluştur
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: process.env.EMBEDDING_MODEL || 'text-embedding-004' 
    });

    const result = await model.embedContent(text);
    const embedding = result.embedding.values;
    
    if (!embedding || embedding.length === 0) {
      throw new Error('Embedding oluşturulamadı');
    }

    return embedding;
  } catch (error) {
    console.error('Embedding hatası:', error);
    throw new Error('Embedding oluşturulamadı');
  }
};

/**
 * Batch embedding oluştur
 */
export const generateBatchEmbeddings = async (texts: string[]): Promise<number[][]> => {
  try {
    const embeddings: number[][] = [];
    
    // Her metin için sırayla embedding oluştur (rate limiting için)
    for (const text of texts) {
      const embedding = await generateEmbedding(text);
      embeddings.push(embedding);
      
      // Rate limiting için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return embeddings;
  } catch (error) {
    console.error('Batch embedding hatası:', error);
    throw new Error('Batch embedding oluşturulamadı');
  }
};

/**
 * Chat completion
 */
export const generateChatResponse = async (
  userMessage: string,
  context: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const systemPrompt = `Sen uzman bir döküman asistanısın. Verilen döküman içeriğinden faydalanarak kullanıcının sorularını yanıtlıyorsun.

GÖREVIN:
- Aşağıdaki numaralı döküman bölümlerini incele
- Kullanıcının sorusuna cevap verebilecek bölümleri belirle  
- Sadece ilgili bölümlerdeki bilgileri kullanarak yanıt ver
- Yanıtının sonunda hangi bölümleri kullandığını belirt

DÖKÜMAN BÖLÜMLER:
${context}

SORU: ${userMessage}

YANITINIZ:
[Cevabınız burada]

KULLANILAN BÖLÜMLER: [Sadece kullandığınız bölüm numaralarını yazın, örn: 1,3]`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('AI response boş');
    }

    return text;
  } catch (error) {
    console.error('Chat completion hatası:', error);
    throw new Error('AI yanıtı oluşturulamadı');
  }
};

/**
 * Soru için embedding oluştur ve context çek
 */
export const generateQueryEmbedding = async (query: string): Promise<number[]> => {
  return generateEmbedding(query);
}; 