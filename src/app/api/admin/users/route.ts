import { NextRequest, NextResponse } from 'next/server';
import { listUsers, addUser, removeUser } from '@/lib/users';
import { getAuthUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  const role = request.headers.get('x-user-role');
  return role === 'admin';
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { username, password, role } = await request.json();
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 });
    }
    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json({ error: '角色必须是 admin 或 user' }, { status: 400 });
    }
    const user = await addUser(username, password, role);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'DUPLICATE_USERNAME') {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 });
    }
    console.error('Add user error:', error);
    return NextResponse.json({ error: '创建用户失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Prevent self-deletion
    const currentUser = await getAuthUser(request);
    if (currentUser && currentUser.userId === userId) {
      return NextResponse.json({ error: '不能删除自己' }, { status: 400 });
    }

    await removeUser(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    console.error('Delete user error:', error);
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 });
  }
}
