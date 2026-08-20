'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SafeUser {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword) return;

    setError('');
    setAdding(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername.trim(), password: newPassword, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '创建失败');
      }

      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (targetUserId: string) => {
    if (!confirm(language === 'zh' ? '确定删除此用户？' : 'Confirm delete this user?')) return;

    setDeleting(targetUserId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除失败');
      }

      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          {t('admin.title') || '用户管理'}
        </h1>
        <Link href="/">
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('admin.backToApp') || '返回应用'}
          </Button>
        </Link>
      </div>

      {/* Add user form */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            {t('admin.addUser') || '添加用户'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">
                {t('admin.username') || '用户名'}
              </label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                placeholder="newuser"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">
                {t('admin.password') || '密码'}
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="w-28">
              <label className="text-xs text-slate-400 mb-1 block">
                {t('admin.role') || '角色'}
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                className="w-full h-9 rounded-md bg-slate-800 border-slate-600 text-slate-200 text-sm px-2"
              >
                <option value="user">{t('admin.roleUser') || '普通用户'}</option>
                <option value="admin">{t('admin.roleAdmin') || '管理员'}</option>
              </select>
            </div>
            <Button
              type="submit"
              disabled={!newUsername.trim() || !newPassword || adding}
              className="bg-orange-500 hover:bg-orange-600 text-white h-9"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t('admin.createUser') || '创建'
              )}
            </Button>
          </form>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* User list */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              `${users.length} ${language === 'zh' ? '个用户' : ' users'}`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {users.map(u => (
              <div
                key={u.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium">{u.username}</span>
                  <Badge
                    variant="outline"
                    className={
                      u.role === 'admin'
                        ? 'text-orange-400 border-orange-400/50 text-xs'
                        : 'text-slate-400 border-slate-600 text-xs'
                    }
                  >
                    {u.role === 'admin'
                      ? (t('admin.roleAdmin') || '管理员')
                      : (t('admin.roleUser') || '普通用户')}
                  </Badge>
                  {u.id === user?.userId && (
                    <span className="text-xs text-slate-500">({language === 'zh' ? '你' : 'you'})</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={u.id === user?.userId || deleting === u.id}
                    onClick={() => handleDelete(u.id)}
                    className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    title={u.id === user?.userId ? (language === 'zh' ? '不能删除自己' : 'Cannot delete yourself') : undefined}
                  >
                    {deleting === u.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {!isLoading && users.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">No users</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
