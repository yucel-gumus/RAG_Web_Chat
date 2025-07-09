import { NextRequest, NextResponse } from 'next/server';
import { getIndexStats } from '@/lib/pinecone';

export async function GET(request: NextRequest) {
  try {
    // Pinecone index stats'ları al
    const indexStats = await getIndexStats();

    const totalVectors = indexStats.totalRecordCount || 0;
    
    return NextResponse.json({
      success: true,
      totalVectors,
      indexStats,
      message: totalVectors > 0 
        ? `${totalVectors} vektör Pinecone'da mevcut`
        : 'Henüz vektör bulunamadı'
    });
  } catch (error) {
    console.error('Döküman listesi hatası:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Döküman listesi alınamadı',
        success: false 
      },
      { status: 500 }
    );
  }
} 