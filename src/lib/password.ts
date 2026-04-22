// This file is only imported in Node.js runtime (API routes, seed)
// It will NEVER be imported in Edge Runtime (middleware)

// Dynamic import to avoid static analysis detection
async function getCrypto() {
  return await import('node:crypto');
}

export async function hashPassword(password: string): Promise<string> {
  const { randomBytes, pbkdf2Sync } = await getCrypto();
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `pbkdf2_${salt}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith('pbkdf2_')) {
    const { pbkdf2Sync } = await getCrypto();
    const [salt, hash] = stored.slice(7).split('$');
    const computed = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return computed === hash;
  }
  return false;
}
