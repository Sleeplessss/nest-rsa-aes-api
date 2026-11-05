import * as crypto from 'crypto';
import { CryptoService } from './crypto.service';

export function makeKeys() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  });
}

describe('CryptoService', () => {
  const keys = makeKeys();
  const service = new CryptoService(keys);

  it('generates a random 32-char alphanumeric AES key', () => {
    const k1 = service.generateAesKey();
    const k2 = service.generateAesKey();
    expect(k1).toMatch(/^[A-Za-z0-9]{32}$/);
    expect(k1).not.toEqual(k2);
  });

  it('AES encrypt/decrypt round trip with random IV', () => {
    const key = service.generateAesKey();
    const c1 = service.aesEncrypt('hello', key);
    const c2 = service.aesEncrypt('hello', key);
    expect(c1).not.toEqual(c2);
    expect(service.aesDecrypt(c1, key)).toBe('hello');
  });

  it('RSA private encrypt -> public decrypt', () => {
    const cipher = service.rsaPrivateEncrypt('secret-key');
    expect(service.rsaPublicDecrypt(cipher)).toBe('secret-key');
  });

  it.each(['', 'Hello world', 'ภาษาไทย 🚀', 'x'.repeat(2000)])('encrypt -> decrypt round trip (%#)', (payload) => {
    const { data1, data2 } = service.encrypt(payload);
    expect(typeof data1).toBe('string');
    expect(typeof data2).toBe('string');
    expect(service.decrypt(data1, data2)).toEqual({ payload });
  });

  it('fails to decrypt data1 produced by a different key pair', () => {
    const other = new CryptoService(makeKeys());
    const { data1, data2 } = other.encrypt('hello');
    expect(() => service.decrypt(data1, data2)).toThrow();
  });

  it('fails to decrypt tampered/garbage data2', () => {
    const { data1 } = service.encrypt('hello');
    expect(() => service.decrypt(data1, 'bm90LXZhbGlk')).toThrow();
  });

  it('loads keys from env vars on module init', () => {
    process.env.PRIVATE_KEY = keys.privateKey.replace(/\n/g, '\\n');
    process.env.PUBLIC_KEY = keys.publicKey;
    const s = new CryptoService();
    s.onModuleInit();
    const { data1, data2 } = s.encrypt('env');
    expect(service.decrypt(data1, data2).payload).toBe('env');
    delete process.env.PRIVATE_KEY;
    delete process.env.PUBLIC_KEY;
  });
});
