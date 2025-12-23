import { Request, Response } from 'express';
import Busboy from 'busboy';
import { prisma } from '../config/prisma.js';
import { withFtp, withSftp } from '../services/connectorService.js';
import { normalizeRemotePath, sanitizePathInput } from '../utils/path.js';
import { logAudit } from '../services/auditService.js';
import { env } from '../config/env.js';

async function getBasePath(connectorId: string) {
  const connector = await prisma.connector.findUnique({ where: { id: connectorId } });
  if (!connector) {
    throw new Error('Connector not found');
  }
  return connector.basePath;
}

export async function listFiles(req: Request, res: Response) {
  const connectorId = String(req.query.connectorId);
  const rawPath = sanitizePathInput(String(req.query.path ?? '.'));
  const basePath = await getBasePath(connectorId);
  const targetPath = normalizeRemotePath(basePath, rawPath);
  const connector = await prisma.connector.findUnique({ where: { id: connectorId } });
  if (!connector) {
    return res.status(404).json({ message: 'Connector not found' });
  }
  if (connector.protocol === 'SFTP') {
    await withSftp(connectorId, async (client) => {
      const list = await client.list(targetPath);
      res.json(list.map((item) => ({
        name: item.name,
        type: item.type === 'd' ? 'folder' : 'file',
        size: item.size,
        modifiedAt: item.modifyTime
      })));
    });
  } else {
    await withFtp(connectorId, async (client) => {
      const list = await client.list(targetPath);
      res.json(list.map((item) => ({
        name: item.name,
        type: item.isDirectory ? 'folder' : 'file',
        size: item.size,
        modifiedAt: item.modifiedAt
      })));
    });
  }
}

export async function makeDir(req: Request, res: Response) {
  const { connectorId, path } = req.body as { connectorId: string; path: string };
  const basePath = await getBasePath(connectorId);
  const targetPath = normalizeRemotePath(basePath, sanitizePathInput(path));
  const connector = await prisma.connector.findUnique({ where: { id: connectorId } });
  if (!connector) {
    return res.status(404).json({ message: 'Connector not found' });
  }
  if (connector.protocol === 'SFTP') {
    await withSftp(connectorId, async (client) => {
      await client.mkdir(targetPath, true);
    });
  } else {
    await withFtp(connectorId, async (client) => {
      await client.ensureDir(targetPath);
    });
  }
  await logAudit({
    userId: (req as any).user.id,
    connectorId,
    action: 'mkdir',
    path: targetPath,
    ip: req.ip,
    status: 'success'
  });
  return res.status(201).json({ path: targetPath });
}

export async function uploadFile(req: Request, res: Response) {
  const connectorId = String(req.query.connectorId || req.body.connectorId);
  const basePath = await getBasePath(connectorId);
  const connector = await prisma.connector.findUnique({ where: { id: connectorId } });
  if (!connector) {
    return res.status(404).json({ message: 'Connector not found' });
  }
  const busboy = Busboy({ headers: req.headers, limits: { fileSize: env.maxUploadMb * 1024 * 1024 } });
  let uploadPath = '.';
  let uploadedName = '';

  busboy.on('field', (name, value) => {
    if (name === 'path') {
      uploadPath = sanitizePathInput(value);
    }
  });

  busboy.on('file', async (name, file, info) => {
    uploadedName = info.filename;
    const targetPath = normalizeRemotePath(basePath, `${uploadPath}/${uploadedName}`);
    try {
      if (connector.protocol === 'SFTP') {
        await withSftp(connectorId, async (client) => {
          await client.put(file, targetPath);
        });
      } else {
        await withFtp(connectorId, async (client) => {
          await client.uploadFrom(file, targetPath);
        });
      }
      await logAudit({
        userId: (req as any).user.id,
        connectorId,
        action: 'upload',
        path: targetPath,
        ip: req.ip,
        status: 'success'
      });
      res.status(201).json({ path: targetPath });
    } catch (error) {
      await logAudit({
        userId: (req as any).user.id,
        connectorId,
        action: 'upload',
        path: targetPath,
        ip: req.ip,
        status: 'failed',
        meta: { error: (error as Error).message }
      });
      res.status(400).json({ message: 'Upload failed' });
    }
  });

  busboy.on('error', () => {
    res.status(413).json({ message: 'File too large' });
  });

  req.pipe(busboy);
}

export async function downloadFile(req: Request, res: Response) {
  const connectorId = String(req.query.connectorId);
  const rawPath = sanitizePathInput(String(req.query.path));
  const basePath = await getBasePath(connectorId);
  const targetPath = normalizeRemotePath(basePath, rawPath);
  const connector = await prisma.connector.findUnique({ where: { id: connectorId } });
  if (!connector) {
    return res.status(404).json({ message: 'Connector not found' });
  }
  res.setHeader('Content-Disposition', `attachment; filename="${targetPath.split('/').pop()}"`);
  if (connector.protocol === 'SFTP') {
    await withSftp(connectorId, async (client) => {
      const stream = await client.get(targetPath);
      if (stream instanceof Buffer) {
        res.end(stream);
      } else {
        stream.pipe(res);
      }
    });
  } else {
    await withFtp(connectorId, async (client) => {
      await client.downloadTo(res, targetPath);
    });
  }
  await logAudit({
    userId: (req as any).user.id,
    connectorId,
    action: 'download',
    path: targetPath,
    ip: req.ip,
    status: 'success'
  });
}

export async function renameFile(req: Request, res: Response) {
  const { connectorId, from, to } = req.body as { connectorId: string; from: string; to: string };
  const basePath = await getBasePath(connectorId);
  const fromPath = normalizeRemotePath(basePath, sanitizePathInput(from));
  const toPath = normalizeRemotePath(basePath, sanitizePathInput(to));
  const connector = await prisma.connector.findUnique({ where: { id: connectorId } });
  if (!connector) {
    return res.status(404).json({ message: 'Connector not found' });
  }
  if (connector.protocol === 'SFTP') {
    await withSftp(connectorId, async (client) => {
      await client.rename(fromPath, toPath);
    });
  } else {
    await withFtp(connectorId, async (client) => {
      await client.rename(fromPath, toPath);
    });
  }
  await logAudit({
    userId: (req as any).user.id,
    connectorId,
    action: 'rename',
    path: fromPath,
    ip: req.ip,
    status: 'success',
    meta: { to: toPath }
  });
  return res.json({ from: fromPath, to: toPath });
}

export async function deleteFile(req: Request, res: Response) {
  const { connectorId, path } = req.body as { connectorId: string; path: string };
  const basePath = await getBasePath(connectorId);
  const targetPath = normalizeRemotePath(basePath, sanitizePathInput(path));
  const connector = await prisma.connector.findUnique({ where: { id: connectorId } });
  if (!connector) {
    return res.status(404).json({ message: 'Connector not found' });
  }
  if (connector.protocol === 'SFTP') {
    await withSftp(connectorId, async (client) => {
      await client.delete(targetPath);
    });
  } else {
    await withFtp(connectorId, async (client) => {
      await client.remove(targetPath);
    });
  }
  await logAudit({
    userId: (req as any).user.id,
    connectorId,
    action: 'delete',
    path: targetPath,
    ip: req.ip,
    status: 'success'
  });
  return res.json({ path: targetPath });
}

export async function moveFile(req: Request, res: Response) {
  const { connectorId, from, to } = req.body as { connectorId: string; from: string; to: string };
  const basePath = await getBasePath(connectorId);
  const fromPath = normalizeRemotePath(basePath, sanitizePathInput(from));
  const toPath = normalizeRemotePath(basePath, sanitizePathInput(to));
  const connector = await prisma.connector.findUnique({ where: { id: connectorId } });
  if (!connector) {
    return res.status(404).json({ message: 'Connector not found' });
  }
  if (connector.protocol === 'SFTP') {
    await withSftp(connectorId, async (client) => {
      await client.rename(fromPath, toPath);
    });
  } else {
    await withFtp(connectorId, async (client) => {
      await client.rename(fromPath, toPath);
    });
  }
  await logAudit({
    userId: (req as any).user.id,
    connectorId,
    action: 'move',
    path: fromPath,
    ip: req.ip,
    status: 'success',
    meta: { to: toPath }
  });
  return res.json({ from: fromPath, to: toPath });
}

async function searchRecursive(connectorId: string, basePath: string, currentPath: string, query: string, results: string[], depth = 0) {
  if (depth > 5) return;
  const connector = await prisma.connector.findUnique({ where: { id: connectorId } });
  if (!connector) return;
  if (connector.protocol === 'SFTP') {
    await withSftp(connectorId, async (client) => {
      const list = await client.list(currentPath);
      for (const item of list) {
        const fullPath = `${currentPath}/${item.name}`;
        if (item.name.toLowerCase().includes(query)) {
          results.push(fullPath.replace(basePath, '') || '/');
        }
        if (item.type === 'd') {
          await searchRecursive(connectorId, basePath, fullPath, query, results, depth + 1);
        }
      }
    });
  } else {
    await withFtp(connectorId, async (client) => {
      const list = await client.list(currentPath);
      for (const item of list) {
        const fullPath = `${currentPath}/${item.name}`;
        if (item.name.toLowerCase().includes(query)) {
          results.push(fullPath.replace(basePath, '') || '/');
        }
        if (item.isDirectory) {
          await searchRecursive(connectorId, basePath, fullPath, query, results, depth + 1);
        }
      }
    });
  }
}

export async function searchFiles(req: Request, res: Response) {
  const connectorId = String(req.query.connectorId);
  const q = String(req.query.q ?? '').toLowerCase();
  const basePath = await getBasePath(connectorId);
  const results: string[] = [];
  await searchRecursive(connectorId, basePath, basePath, q, results);
  await logAudit({
    userId: (req as any).user.id,
    connectorId,
    action: 'search',
    path: basePath,
    ip: req.ip,
    status: 'success',
    meta: { query: q, results: results.length }
  });
  return res.json({ results });
}
