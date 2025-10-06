import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TokNxr - AI Effectiveness & Code Quality Analysis',
    template: '%s | TokNxr',
  },
  description:
    'Track AI token usage and measure code quality effectiveness. Open-source analytics platform for AI-generated code assessment.',
  keywords: [
    'AI',
    'token tracking',
    'code quality',
    'analytics',
    'Supabase',
    'Next.js',
    'TypeScript',
    'open source',
  ],
  authors: [{ name: 'TokNxr Team' }],
  creator: 'TokNxr Team',
  publisher: 'TokNxr',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://toknxr.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://toknxr.com',
    title: 'TokNxr - AI Effectiveness & Code Quality Analysis',
    description:
      'Track AI token usage and measure code quality effectiveness. Open-source analytics platform for AI-generated code assessment.',
    siteName: 'TokNxr',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TokNxr - AI Effectiveness & Code Quality Analysis',
    description:
      'Track AI token usage and measure code quality effectiveness. Open-source analytics platform for AI-generated code assessment.',
  },
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
  verification: {
    google: 'your-google-verification-code',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}