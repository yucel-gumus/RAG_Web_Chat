import { NextResponse } from 'next/server';

/** Global Pinecone stats are not exposed (multi-user privacy). */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    totalVectors: 0,
    message: 'Parça sayısı yalnızca bu oturumda eklediğiniz sitelerden hesaplanır.',
  });
}