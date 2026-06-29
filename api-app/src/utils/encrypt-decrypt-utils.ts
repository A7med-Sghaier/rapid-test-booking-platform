/*************************************************************
 * api-app - encrypt-decrypt-utils.ts
 *
 * created by : Ahmed Sghaier - a7mado008@gmail.com
 * created on : 14.02.22 - 17:59
 * version : 1.0
 * copyright : all right reserved 2022
 *************************************************************/
import * as crypto from 'crypto';

const algorithm = 'aes-128-cbc';
const iv = crypto.randomBytes(16);

export const encrypt = (text, secretKey) => {
  const keyHash = crypto.createHash('sha1').update(secretKey);
  let hashedKey = keyHash.copy().digest().slice(0, 16);

  const cipher = crypto.createCipheriv(algorithm, hashedKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + '.' + encrypted.toString('hex');
};

export const decrypt = (hash, secretKey) => {
  const keyHash = crypto.createHash('sha1').update(secretKey);
  let hashedKey = keyHash.copy().digest().slice(0, 16);

  const [hashIv, hashContent] = hash.split('.');
  const decipher = crypto.createDecipheriv(
    algorithm,
    hashedKey,
    Buffer.from(hashIv, 'hex')
  );
  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hashContent, 'hex')),
    decipher.final(),
  ]);

  return decrpyted.toString();
};

export const convertToSHA256 = (text: string) =>
  crypto.createHash('sha-256').update(text).copy().digest('hex');

export const convertToBase64Url = (obj: any) =>
  Buffer.from(JSON.stringify(obj)).toString('base64url');
