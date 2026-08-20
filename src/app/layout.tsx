import type { Metadata } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import { LanguageProvider } from '@/hooks/useLanguage';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI灵感锻造炉 | IdeaForge',
    template: '%s | IdeaForge',
  },
  description:
    '将你的毛坯想法锻造为成熟产品方案。AI虚拟产品委员会，五位专家多维度审视你的产品创意。',
  keywords: ['AI灵感锻造炉', 'IdeaForge', '产品创意', 'AI产品方案', '创业', '产品规划'],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
