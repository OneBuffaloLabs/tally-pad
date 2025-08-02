import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import AnalyticsInitializer from '@/components/AnalyticsInitializer';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';
import { generateViewport } from '@/utils/viewport';
// --- Styles ---
import './globals.css';

// Font Awesome CSS fix
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = generateMetadata();
export const viewport: Viewport = generateViewport();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
      <AnalyticsInitializer />
    </html>
  );
}
