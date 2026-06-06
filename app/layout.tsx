import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';

export const metadata: Metadata = {
  title: '웹툰로그',
  description: '웹툰 감상 기록 서비스',
  openGraph: {
    title: '웹툰로그',
    description: '웹툰 감상 기록 서비스',
    images: ['/og-image.png'],
  },
};
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}