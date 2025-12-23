import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { encryptSecret } from '../utils/crypto.js';
import { logAudit } from '../services/auditService.js';
import { getConnectorWithSecret, withFtp, withSftp } from '../services/connectorService.js';

export async function createConnector(req: Request, res: Response) {
  const { name, protocol, host, port, username, password, privateKey, basePath } = req.body as {
    name: string; protocol: string; host: string; port: number; username: string; password: string; privateKey?: string; basePath: string;
  };
  if (protocol !== 'SFTP' && !password) {
    return res.status(400).json({ message: 'Password required for FTP/FTPS' });
  }
  const secret = encryptSecret(password ?? '');
  const privateKeySecret = privateKey ? encryptSecret(privateKey) : null;
  const connector = await prisma.connector.create({
    data: {
      name,
      protocol,
      host,
      port,
      username,
      secretEncrypted: secret.encrypted,
      secretIv: secret.iv,
      secretTag: secret.tag,
      privateKeyEncrypted: privateKeySecret?.encrypted,
      privateKeyIv: privateKeySecret?.iv,
      privateKeyTag: privateKeySecret?.tag,
      basePath,
      createdById: (req as any).user.id
    },
    select: {
      id: true,
      name: true,
      protocol: true,
      host: true,
      port: true,
      username: true,
      basePath: true,
      createdById: true,
      createdAt: true
    }
  });
  await logAudit({
    userId: (req as any).user.id,
    connectorId: connector.id,
    action: 'create_connector',
    ip: req.ip,
    status: 'success'
  });
  return res.status(201).json(connector);
}

export async function listConnectors(req: Request, res: Response) {
  const user = (req as any).user;
  if (user.role === 'ADMIN') {
    const connectors = await prisma.connector.findMany({
      select: {
        id: true,
        name: true,
        protocol: true,
        host: true,
        port: true,
        username: true,
        basePath: true,
        createdById: true,
        createdAt: true
      }
    });
    return res.json(connectors);
  }
  const connectors = await prisma.connector.findMany({
    where: {
      permissions: { some: { userId: user.id } }
    },
    select: {
      id: true,
      name: true,
      protocol: true,
      host: true,
      port: true,
      username: true,
      basePath: true,
      createdById: true,
      createdAt: true
    }
  });
  return res.json(connectors);
}

export async function getConnector(req: Request, res: Response) {
  const { id } = req.params;
  const connector = await prisma.connector.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      protocol: true,
      host: true,
      port: true,
      username: true,
      basePath: true,
      createdById: true,
      createdAt: true
    }
  });
  if (!connector) {
    return res.status(404).json({ message: 'Not found' });
  }
  return res.json(connector);
}

export async function updateConnector(req: Request, res: Response) {
  const { id } = req.params;
  const { name, host, port, username, password, privateKey, basePath } = req.body as {
    name?: string; host?: string; port?: number; username?: string; password?: string; privateKey?: string; basePath?: string;
  };
  const data: any = { name, host, port, username, basePath };
  if (password) {
    const secret = encryptSecret(password);
    data.secretEncrypted = secret.encrypted;
    data.secretIv = secret.iv;
    data.secretTag = secret.tag;
  }
  if (privateKey) {
    const secret = encryptSecret(privateKey);
    data.privateKeyEncrypted = secret.encrypted;
    data.privateKeyIv = secret.iv;
    data.privateKeyTag = secret.tag;
  }
  const connector = await prisma.connector.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      protocol: true,
      host: true,
      port: true,
      username: true,
      basePath: true,
      createdById: true,
      createdAt: true
    }
  });
  await logAudit({
    userId: (req as any).user.id,
    connectorId: connector.id,
    action: 'update_connector',
    ip: req.ip,
    status: 'success'
  });
  return res.json(connector);
}

export async function deleteConnector(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.connector.delete({ where: { id } });
  await logAudit({
    userId: (req as any).user.id,
    connectorId: id,
    action: 'delete_connector',
    ip: req.ip,
    status: 'success'
  });
  return res.status(204).send();
}

export async function testConnector(req: Request, res: Response) {
  const { id } = req.params;
  const connector = await getConnectorWithSecret(id);
  try {
    if (connector.protocol === 'SFTP') {
      await withSftp(id, async (client) => {
        await client.list('.');
      });
    } else {
      await withFtp(id, async (client) => {
        await client.list('/');
      });
    }
    await logAudit({
      userId: (req as any).user.id,
      connectorId: id,
      action: 'test_connector',
      ip: req.ip,
      status: 'success'
    });
    return res.json({ status: 'ok' });
  } catch (error) {
    await logAudit({
      userId: (req as any).user.id,
      connectorId: id,
      action: 'test_connector',
      ip: req.ip,
      status: 'failed',
      meta: { error: (error as Error).message }
    });
    return res.status(400).json({ message: 'Connection failed' });
  }
}
