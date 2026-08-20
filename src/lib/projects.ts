import { readFile, writeFile, rename, unlink } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { ensureDataDir } from './bootstrap';
import { Project, ProjectSummary } from '@/types';

const PROJECTS_DIR = path.join(process.cwd(), 'data', 'projects');
const INDEX_FILE = path.join(PROJECTS_DIR, 'index.json');

let writeMutex: Promise<void> = Promise.resolve();
let dirEnsured = false;

async function ensureProjectsDir(): Promise<void> {
  if (dirEnsured) return;
  await ensureDataDir();
  // ensureDataDir only creates data/, need to also ensure data/projects/
  const { mkdir } = await import('fs/promises');
  await mkdir(PROJECTS_DIR, { recursive: true });
  dirEnsured = true;
}

export function generateProjectId(): string {
  return `proj_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`;
}

function toSummary(project: Project): ProjectSummary {
  return {
    id: project.id,
    title: project.title,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    currentStage: project.currentStage,
    progress: project.progress,
    isCompleted: project.isCompleted,
  };
}

// ====== Internal read/write ======

async function readIndex(): Promise<ProjectSummary[]> {
  await ensureProjectsDir();
  try {
    const raw = await readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await writeFile(INDEX_FILE, '[]');
      return [];
    }
    throw error;
  }
}

async function writeIndex(summaries: ProjectSummary[]): Promise<void> {
  await ensureProjectsDir();
  writeMutex = writeMutex.then(async () => {
    const tmp = INDEX_FILE + '.tmp';
    await writeFile(tmp, JSON.stringify(summaries, null, 2));
    await rename(tmp, INDEX_FILE);
  });
  await writeMutex;
}

async function readProjectFile(id: string): Promise<Project | null> {
  await ensureProjectsDir();
  try {
    const file = path.join(PROJECTS_DIR, `${id}.json`);
    const raw = await readFile(file, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

async function writeProjectFile(id: string, project: Project): Promise<void> {
  await ensureProjectsDir();
  const file = path.join(PROJECTS_DIR, `${id}.json`);
  // Atomic write
  writeMutex = writeMutex.then(async () => {
    const tmp = file + '.tmp';
    await writeFile(tmp, JSON.stringify(project, null, 2));
    await rename(tmp, file);
  });
  await writeMutex;
}

async function deleteProjectFile(id: string): Promise<void> {
  await ensureProjectsDir();
  const file = path.join(PROJECTS_DIR, `${id}.json`);
  try {
    await unlink(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}

// ====== Public API ======

export async function createProject(
  userId: string,
  title: string,
): Promise<Project> {
  const now = new Date().toISOString();
  const project: Project = {
    id: generateProjectId(),
    title: title || '未命名项目',
    userId,
    createdAt: now,
    updatedAt: now,
    currentStage: 'need-sensing',
    progress: 0,
    userInput: '',
    initialIdea: '',
    finalDocument: '',
    expertReports: {},
    needSensingData: null,
    showAdviceSummary: false,
    selectedDirection: null,
    isCompleted: false,
  };

  // Write full project file
  await writeProjectFile(project.id, project);

  // Update index
  const index = await readIndex();
  index.unshift(toSummary(project));
  await writeIndex(index);

  return project;
}

export async function listProjects(userId: string): Promise<ProjectSummary[]> {
  const index = await readIndex();
  return index.filter(s => s.userId === userId);
}

export async function getProject(id: string): Promise<Project | null> {
  return readProjectFile(id);
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, 'id' | 'userId' | 'createdAt'>>,
): Promise<Project | null> {
  const project = await readProjectFile(id);
  if (!project) return null;

  Object.assign(project, data, {
    updatedAt: new Date().toISOString(),
  });

  // Write full project file
  await writeProjectFile(id, project);

  // Update index entry
  const index = await readIndex();
  const idx = index.findIndex(s => s.id === id);
  if (idx >= 0) {
    index[idx] = toSummary(project);
  } else {
    index.unshift(toSummary(project));
  }
  await writeIndex(index);

  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  const project = await readProjectFile(id);
  if (!project) return false;

  // Remove from index (soft delete — keep the project file)
  const index = await readIndex();
  const filtered = index.filter(s => s.id !== id);
  if (filtered.length === index.length) return false;
  await writeIndex(filtered);

  // Also delete the project file for cleanliness
  await deleteProjectFile(id);

  return true;
}
