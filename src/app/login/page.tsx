'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setError('');
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-sm bg-slate-900 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-xl">
            {t('auth.loginTitle') || '登录'}
          </CardTitle>
          <p className="text-slate-400 text-sm mt-1">
            {t('auth.loginSubtitle') || '登录以使用灵感锻造炉'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                {t('auth.username') || '用户名'}
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                placeholder="admin"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                {t('auth.password') || '密码'}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              disabled={!username.trim() || !password || isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('auth.loggingIn') || '登录中...'}
                </>
              ) : (
                t('auth.loginButton') || '登录'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
