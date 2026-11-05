// Generates a 2048-bit RSA key pair into ./keys (alternative to https://cryptotools.net/rsagen)
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'keys');
fs.mkdirSync(dir, { recursive: true });
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
});
fs.writeFileSync(path.join(dir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(dir, 'public.pem'), publicKey);
console.log('Keys written to', dir);
