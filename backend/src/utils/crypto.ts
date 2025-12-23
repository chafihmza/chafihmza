import crypto from 'crypto';
import { env } from '../config/env.js';

const KEY_LENGTH = 32;

function getKey(): Buffer {
  const key = Buffer.from(env.connectorMasterKey, 'hex');
  if (key.length !== KEY_LENGTH) {
    throw new Error('CONNECTOR_MASTER_KEY must be 32 bytes hex');
  }
  return key;
}

export function encryptSecret(plain: string) {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}

export function decryptSecret(encrypted: string, iv: string, tag: string) {
  const key = getKey();
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}
