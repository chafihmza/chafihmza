import path from 'path';

export function normalizeRemotePath(basePath: string, targetPath: string) {
  const cleanBase = path.posix.normalize('/' + basePath).replace(/\/g, '/');
  const cleanTarget = path.posix.normalize('/' + targetPath).replace(/\/g, '/');
  const joined = path.posix.join(cleanBase, cleanTarget);
  if (!joined.startsWith(cleanBase)) {
    throw new Error('Path traversal detected');
  }
  return joined;
}

export function sanitizePathInput(input: string) {
  return input.replace(/\0/g, '');
}
