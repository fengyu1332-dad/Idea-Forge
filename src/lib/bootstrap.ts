import { mkdir } from 'fs/promises';
import path from 'path';

let ensured = false;

export async function ensureDataDir(): Promise<void> {
  if (ensured) return;
  await mkdir(path.join(process.cwd(), 'data'), { recursive: true });
  ensured = true;
}
