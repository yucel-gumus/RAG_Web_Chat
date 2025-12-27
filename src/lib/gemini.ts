const AI_API_URL = process.env.AI_API_URL || process.env.NEXT_PUBLIC_AI_API_URL;

if (!AI_API_URL) {
  console.warn('AI_API_URL environment variable is not set');
}

export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!AI_API_URL) {
    throw new Error('AI_API_URL is not configured. Please set AI_API_URL in your .env file');
  }

  const response = await fetch(`${AI_API_URL}/api/embedding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Embedding API hatası');
  }

  const data = await response.json();
  return data.embedding;
};

export const generateBatchEmbeddings = async (texts: string[]): Promise<number[][]> => {
  const embeddings: number[][] = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return embeddings;
};

export const generateChatResponse = async (
  userMessage: string,
  context: string
): Promise<string> => {
  if (!AI_API_URL) {
    throw new Error('AI_API_URL is not configured. Please set AI_API_URL in your .env file');
  }

  const response = await fetch(`${AI_API_URL}/api/rag-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage, context }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Chat API hatası');
  }

  const data = await response.json();
  return data.response;
};

export const generateQueryEmbedding = async (query: string): Promise<number[]> => {
  return generateEmbedding(query);
};