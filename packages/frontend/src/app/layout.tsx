import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata, Viewport } from 'next';
import ClientLayout from '@/components/layout/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Anonim Oylama Platformu',
  description: 'Günlük sorulara anonim olarak cevap verin ve toplumun nabzını tutun.',
  keywords: 'anonim oylama, anket, günün sorusu, toplum görüşü, demografik analiz',
  authors: [{ name: 'Anonim Oylama Ekibi' }],
  openGraph: {
    title: 'Anonim Oylama Platformu',
    description: 'Günlük sorulara anonim olarak cevap verin ve toplumun nabzını tutun.',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anonim Oylama Platformu',
    description: 'Günlük sorulara anonim olarak cevap verin ve toplumun nabzını tutun.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
