import SftpClient from 'ssh2-sftp-client';
import { Client as FtpClient } from 'basic-ftp';
import { decryptSecret } from '../utils/crypto.js';
import { prisma } from '../config/prisma.js';

export async function getConnectorWithSecret(connectorId: string) {
  const connector = await prisma.connector.findUnique({ where: { id: connectorId } });
  if (!connector) {
    throw new Error('Connector not found');
  }
  const secret = decryptSecret(
    connector.secretEncrypted,
    connector.secretIv,
    connector.secretTag
  );
  const privateKey = connector.privateKeyEncrypted
    ? decryptSecret(
        connector.privateKeyEncrypted,
        connector.privateKeyIv ?? '',
        connector.privateKeyTag ?? ''
      )
    : undefined;
  return { ...connector, secret, privateKey };
}

export async function withSftp(connectorId: string, fn: (client: SftpClient) => Promise<void>) {
  const connector = await getConnectorWithSecret(connectorId);
  const client = new SftpClient();
  await client.connect({
    host: connector.host,
    port: connector.port,
    username: connector.username,
    password: connector.secret || undefined,
    privateKey: connector.privateKey
  });
  try {
    await fn(client);
  } finally {
    await client.end();
  }
}

export async function withFtp(connectorId: string, fn: (client: FtpClient) => Promise<void>) {
  const connector = await getConnectorWithSecret(connectorId);
  const client = new FtpClient();
  client.ftp.verbose = false;
  await client.access({
    host: connector.host,
    port: connector.port,
    user: connector.username,
    password: connector.secret,
    secure: connector.protocol === 'FTPS'
  });
  try {
    await fn(client);
  } finally {
    client.close();
  }
}
