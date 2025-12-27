import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from 'sonner';
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
  GoogleAnalytics,
} from '@/components/analytics';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'AI 시대의 커리어 - 커리어리',
    template: '%s | Careerly',
  },
  description:
    '개발자, 디자이너, PM을 위한 커리어 성장 커뮤니티. 업계 인사이트를 공유하고 성장하세요.',
  keywords: [
    '커리어',
    '개발자',
    '디자이너',
    'PM',
    '커뮤니티',
    '이직',
    '취업',
    '채용',
  ],
  authors: [{ name: 'Careerly' }],
  creator: 'Careerly',
  publisher: 'Careerly',
  metadataBase: new URL('https://careerly.co.kr'),

  // Favicon
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png' }],
  },

  // Open Graph
  openGraph: {
    type: 'article',
    locale: 'ko_KR',
    url: 'https://careerly.co.kr',
    siteName: '커리어리',
    title: 'AI 시대의 커리어 - 커리어리',
    description:
      '개발자, 디자이너, PM을 위한 커리어 성장 커뮤니티. 업계 인사이트를 공유하고 성장하세요.',
    images: [
      {
        url: '/og-image.png',
        alt: 'AI 시대의 커리어 - 커리어리',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary',
    title: 'AI 시대의 커리어 - 커리어리',
    description:
      '개발자, 디자이너, PM을 위한 커리어 성장 커뮤니티. 업계 인사이트를 공유하고 성장하세요.',
    images: ['/og-image.png'],
  },

  // App Links (앱 연결)
  other: {
    'al:android:package': 'com.publy.news',
    'al:android:app_name': 'careerly',
    'al:ios:app_store_id': '1474321863',
    'al:ios:app_name': 'careerly',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
      <head>
        <meta name="theme-color" content="#f8fafc" />
        <GoogleTagManager />
        <GoogleAnalytics />
      </head>
      <body className="antialiased bg-slate-50" style={{ backgroundColor: '#f8fafc' }}>
        <GoogleTagManagerNoScript />
        <ReactQueryProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster
            position="top-center"
            visibleToasts={1}
            toastOptions={{
              className: 'safe-mt',
            }}
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
