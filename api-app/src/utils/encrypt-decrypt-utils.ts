/*************************************************************
 * api-app - encrypt-decrypt-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.02.22 - 17:59
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';

// Derive a 32-byte AES-256 key from the configured secret with SHA-256.
const deriveKey = (secretKey: string) =>
  crypto.createHash('sha256').update(secretKey).digest();

export const encrypt = (text, secretKey) => {
  // A fresh random IV per call — never reuse an IV with the same key in CBC.
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, deriveKey(secretKey), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + '.' + encrypted.toString('hex');
};

export const decrypt = (hash, secretKey) => {
  const [hashIv, hashContent] = hash.split('.');
  const decipher = crypto.createDecipheriv(
    algorithm,
    deriveKey(secretKey),
    Buffer.from(hashIv, 'hex')
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hashContent, 'hex')),
    decipher.final(),
  ]);

  return decrypted.toString();
};

export const convertToSHA256 = (text: string) =>
  crypto.createHash('sha-256').update(text).copy().digest('hex');

export const convertToBase64Url = (obj: any) =>
  Buffer.from(JSON.stringify(obj)).toString('base64url');
