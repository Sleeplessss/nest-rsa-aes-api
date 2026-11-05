import { Injectable, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Hybrid encryption:
 *  - payload is encrypted with a random AES-256 key   -> data2
 *  - the AES key is encrypted with the RSA private key -> data1
 * Anyone holding the public key can recover the AES key and then the payload.
 */
@Injectable()
export class CryptoService implements OnModuleInit {
  static readonly AES_ALGORITHM = 'aes-256-cbc';
  static readonly AES_KEY_LENGTH = 32; // 32 chars -> 256-bit key
  static readonly IV_LENGTH = 16;

  private privateKey!: string;
  private publicKey!: string;

  constructor(keys?: { privateKey: string; publicKey: string }) {
    if (keys) {
      this.privateKey = keys.privateKey;
      this.publicKey = keys.publicKey;
    }
  }

  onModuleInit(): void {
    if (this.privateKey && this.publicKey) return;
    this.privateKey = CryptoService.loadKey('PRIVATE_KEY', 'private.pem');
    this.publicKey = CryptoService.loadKey('PUBLIC_KEY', 'public.pem');
  }

  /** Read a PEM key from an env var (\n-escaped allowed) or from ./keys/<file>. */
  static loadKey(envName: string, fileName: string): string {
    const fromEnv = process.env[envName];
    if (fromEnv) return fromEnv.replace(/\\n/g, '\n');
    const dir = process.env.KEYS_DIR || path.join(process.cwd(), 'keys');
    return fs.readFileSync(path.join(dir, fileName), 'utf8');
  }

  /** Step 2: create AES key by generating a random string. */
  generateAesKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = crypto.randomBytes(CryptoService.AES_KEY_LENGTH);
    let key = '';
    for (let i = 0; i < bytes.length; i++) key += chars[bytes[i] % chars.length];
    return key;
  }

  /** AES encrypt; output = base64(iv || ciphertext). */
  aesEncrypt(plainText: string, aesKey: string): string {
    const iv = crypto.randomBytes(CryptoService.IV_LENGTH);
    const cipher = crypto.createCipheriv(CryptoService.AES_ALGORITHM, Buffer.from(aesKey, 'utf8'), iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString('base64');
  }

  aesDecrypt(cipherText: string, aesKey: string): string {
    const raw = Buffer.from(cipherText, 'base64');
    if (raw.length <= CryptoService.IV_LENGTH) throw new Error('Invalid AES cipher text');
    const iv = raw.subarray(0, CryptoService.IV_LENGTH);
    const data = raw.subarray(CryptoService.IV_LENGTH);
    const decipher = crypto.createDecipheriv(CryptoService.AES_ALGORITHM, Buffer.from(aesKey, 'utf8'), iv);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  }

  /** Step 4: encrypt AES key with the RSA private key. */
  rsaPrivateEncrypt(text: string): string {
    return crypto
      .privateEncrypt({ key: this.privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(text, 'utf8'))
      .toString('base64');
  }

  /** Decrypt data encrypted by the private key, using the RSA public key. */
  rsaPublicDecrypt(cipherText: string): string {
    return crypto
      .publicDecrypt({ key: this.publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(cipherText, 'base64'))
      .toString('utf8');
  }

  encrypt(payload: string): { data1: string; data2: string } {
    const aesKey = this.generateAesKey();
    const data2 = this.aesEncrypt(payload, aesKey);
    const data1 = this.rsaPrivateEncrypt(aesKey);
    return { data1, data2 };
  }

  decrypt(data1: string, data2: string): { payload: string } {
    const aesKey = this.rsaPublicDecrypt(data1);
    if (aesKey.length !== CryptoService.AES_KEY_LENGTH) throw new Error('Invalid AES key');
    return { payload: this.aesDecrypt(data2, aesKey) };
  }
}
