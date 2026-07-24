/**
 * Server-side proxy to python_backend (Gemini Gateway).
 */
const DEFAULT_GATEWAY_URL = 'https://python-backend-270384591051.europe-west3.run.app';

export function getGatewayBaseUrl(): string {
  const url =
    process.env.AI_API_URL ||
    process.env.GEMINI_GATEWAY_URL ||
    DEFAULT_GATEWAY_URL;
  return url.replace(/\/$/, '');
}

export function getGatewayClientApiKey(): string {
  const key =
    process.env.GATEWAY_CLIENT_API_KEY ||
    process.env.CLIENT_API_KEY ||
    '';
  if (!key) {
    console.error('[gateway] Missing GATEWAY_CLIENT_API_KEY environment variable.');
    throw new Error('GATEWAY_CLIENT_API_KEY is not configured.');
  }
  return key;
}

export function getGatewayAdminApiKey(): string {
  const key =
    process.env.GATEWAY_ADMIN_API_KEY ||
    process.env.ADMIN_API_KEY ||
    process.env.GATEWAY_CLIENT_API_KEY ||
    process.env.CLIENT_API_KEY ||
    '';
  if (!key) {
    console.error('[gateway] Missing GATEWAY_ADMIN_API_KEY / GATEWAY_CLIENT_API_KEY environment variable.');
    throw new Error('GATEWAY_ADMIN_API_KEY is not configured.');
  }
  return key;
}

export async function gatewayFetch(
  path: string,
  init: RequestInit & { admin?: boolean } = {},
): Promise<Response> {
  const { admin, ...fetchInit } = init;
  const headers = new Headers(fetchInit.headers);
  const apiKey = admin ? getGatewayAdminApiKey() : getGatewayClientApiKey();
  if (!headers.has('Content-Type') && fetchInit.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-API-Key', apiKey);

  const targetUrl = `${getGatewayBaseUrl()}${path}`;
  try {
    return await fetch(targetUrl, { ...fetchInit, headers });
  } catch (error) {
    console.error(`[gatewayFetch] Connection error to ${targetUrl}:`, error);
    throw error;
  }
}