export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  chunks: string[];
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

export interface EmbeddingRequest {
  content: ScrapedContent;
}

export interface EmbeddingResponse {
  success: boolean;
  vectorId: string;
  error?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  response: string;
  sources: string[];
  conversationId: string;
}

export interface DocumentMetadata {
  url: string;
  title: string;
  timestamp: string;
  chunkIndex: number;
  totalChunks: number;
  content: string;
  [key: string]: string | number | boolean; // Pinecone RecordMetadata uyumluluğu için
} 