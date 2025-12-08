import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from 'sonner';
import {
  GoogleTagManager,
  GoogleTagManagerNoScript,
} from '@/components/analytics';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'Careerly - 커리어 성장을 위한 커뮤니티',
    template: '%s | Careerly',
  },
  description: '개발자, 디자이너, PM을 위한 커리어 성장 커뮤니티. 업계 인사이트를 공유하고 성장하세요.',
  keywords: ['커리어', '개발자', '디자이너', 'PM', '커뮤니티', '이직', '취업', '채용'],
  authors: [{ name: 'Careerly' }],
  creator: 'Careerly',
  publisher: 'Careerly',
  metadataBase: new URL('https://careerly.co.kr'),

  // Favicon
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://careerly.co.kr',
    siteName: 'Careerly',
    title: 'Careerly - 커리어 성장을 위한 커뮤니티',
    description: '개발자, 디자이너, PM을 위한 커리어 성장 커뮤니티. 업계 인사이트를 공유하고 성장하세요.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Careerly - 커리어 성장을 위한 커뮤니티',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Careerly - 커리어 성장을 위한 커뮤니티',
    description: '개발자, 디자이너, PM을 위한 커리어 성장 커뮤니티.',
    images: ['/og-image.png'],
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

  // Verification (추후 설정)
  // verification: {
  //   google: 'google-site-verification-code',
  //   naver: 'naver-site-verification-code',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <GoogleTagManager />
      </head>
      <body className="antialiased">
        <GoogleTagManagerNoScript />
        <ReactQueryProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster position="top-center" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
