import type { Metadata } from 'next';
import { AuthProvider } from '@/hooks/useAuth';
import { LanguageProvider } from '@/hooks/useLanguage';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'IdeaForge | AI Idea Forge',
    template: '%s | IdeaForge',
  },
  description:
    'Forge your raw ideas into polished product plans. An AI virtual product committee reviews your product ideas from five expert dimensions.',
  keywords: ['IdeaForge', 'AI Idea Forge', 'product ideas', 'AI product plans', 'startup', 'product planning'],
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
