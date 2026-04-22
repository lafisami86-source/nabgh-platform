// Password hashing using Web Crypto API (available in both Edge Runtime and Node.js)
// No imports needed — uses the global `crypto` object

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return `pbk2_${toHex(salt.buffer)}$${toHex(bits as ArrayBuffer)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith('pbk2_')) return false;
  const [saltHex, hashHex] = stored.slice(5).split('$');
  const enc = new TextEncoder();
  const saltArr = new Uint8Array(saltHex.length / 2);
  for (let i = 0; i < saltHex.length; i += 2) saltArr[i / 2] = parseInt(saltHex.slice(i, i + 2), 16);
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltArr.buffer as ArrayBuffer, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return toHex(bits as ArrayBuffer) === hashHex;
}
