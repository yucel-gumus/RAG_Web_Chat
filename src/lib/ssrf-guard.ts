import dns from 'dns/promises';
import { isIP } from 'net';

const BLOCKED_HOST_SUFFIXES = ['.local', '.internal', '.localhost', '.lan'];

function hostnameBlocked(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (!host) return true;
  if (host === 'localhost' || host === '0.0.0.0') return true;
  if (host === 'metadata' || host === 'metadata.google.internal') return true;
  return BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s));
}

function ipBlocked(ip: string): boolean {
  if (ip === '::1' || ip === '127.0.0.1' || ip === '0.0.0.0' || ip === '169.254.169.254') {
    return true;
  }
  const version = isIP(ip);
  if (version === 4) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 0) return true;
  }
  if (version === 6) {
    const h = ip.toLowerCase();
    if (h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80')) return true;
    if (h === '::1') return true;
  }
  return false;
}

export function normalizeHttpUrl(raw: string): string {
  const trimmed = raw.trim();
  const parsed = new URL(trimmed);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Yalnızca http/https URL kabul edilir');
  }
  if (parsed.username || parsed.password) {
    throw new Error('Kimlik bilgisi içeren URL kabul edilmez');
  }
  return parsed.toString();
}

export async function assertSafePublicUrl(raw: string): Promise<string> {
  const url = normalizeHttpUrl(raw);
  const parsed = new URL(url);
  const host = parsed.hostname.toLowerCase();

  if (hostnameBlocked(host)) {
    throw new Error('Bu hostname erişime kapalı');
  }

  if (isIP(host)) {
    if (ipBlocked(host)) {
      throw new Error('Özel veya yerel IP adreslerine istek yapılamaz');
    }
    return url;
  }

  const records = await dns.lookup(host, { all: true, verbatim: true });
  if (!records.length) {
    throw new Error('Hostname çözümlenemedi');
  }
  for (const rec of records) {
    if (ipBlocked(rec.address)) {
      throw new Error('URL özel ağ adresine çözümleniyor');
    }
  }
  return url;
}