import { NextRequest, NextResponse } from 'next/server';
import { createProject, listProjects } from '@/lib/projects';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await listProjects(userId);
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('[projects] List error:', error);
    return NextResponse.json({ error: 'Failed to list projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const title = body.title || '未命名项目';

    const project = await createProject(userId, title);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('[projects] Create error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
