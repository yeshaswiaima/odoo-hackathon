import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow-super-secret-key-hrms-2025-secure';

// Helper for secure PBKDF2 password hashing (built into Node.js, 100% dependable)
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  if (!storedHash) return false;
  
  // Support plain text comparison for emergency backwards-compat or seeded demo if needed
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }

  const [salt, hash] = storedHash.split(':');
  const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === checkHash;
};

// Stateless JWT implementation using Node's crypto
export const signToken = (payload, expiresInSeconds = 86400 * 7) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp, iat: Math.floor(Date.now() / 1000) };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  return `${b64Header}.${b64Payload}.${signature}`;
};

export const verifyToken = (token) => {
  if (!token) throw new Error('No token provided');
  
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token structure');

  const [b64Header, b64Payload, signature] = parts;
  
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');

  if (signature !== expectedSig) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
  
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token has expired');
  }

  return payload;
};
