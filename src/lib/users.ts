import { readFile, writeFile, rename } from 'fs/promises';
import path from 'path';
import { ensureDataDir } from './bootstrap';
import { hashPassword, generateUserId } from './auth';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

function sanitize(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

let writeMutex: Promise<void> = Promise.resolve();

async function readUsers(): Promise<User[]> {
  await ensureDataDir();
  try {
    const raw = await readFile(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
      const defaultAdmin: User = {
        id: generateUserId(),
        username: 'admin',
        passwordHash: hashPassword(defaultPassword),
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      await writeFile(USERS_FILE, JSON.stringify([defaultAdmin], null, 2));
      console.log('[auth] Default admin created: username=admin');
      return [defaultAdmin];
    }
    throw error;
  }
}

async function writeUsers(users: User[]): Promise<void> {
  // Atomic write: write to temp file, then rename
  writeMutex = writeMutex.then(async () => {
    const tmp = USERS_FILE + '.tmp';
    await writeFile(tmp, JSON.stringify(users, null, 2));
    await rename(tmp, USERS_FILE);
  });
  await writeMutex;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await readUsers();
  return users.find(u => u.username === username) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await readUsers();
  return users.find(u => u.id === id) || null;
}

export async function listUsers(): Promise<SafeUser[]> {
  const users = await readUsers();
  return users.map(sanitize);
}

export async function addUser(
  username: string,
  password: string,
  role: 'admin' | 'user',
): Promise<SafeUser> {
  const users = await readUsers();
  if (users.some(u => u.username === username)) {
    throw new Error('DUPLICATE_USERNAME');
  }
  const newUser: User = {
    id: generateUserId(),
    username,
    passwordHash: hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  await writeUsers(users);
  return sanitize(newUser);
}

export async function removeUser(userId: string): Promise<void> {
  const users = await readUsers();
  const filtered = users.filter(u => u.id !== userId);
  if (filtered.length === users.length) {
    throw new Error('USER_NOT_FOUND');
  }
  await writeUsers(filtered);
}

export async function changePassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  const users = await readUsers();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('USER_NOT_FOUND');
  user.passwordHash = hashPassword(newPassword);
  await writeUsers(users);
}
