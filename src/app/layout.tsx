import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

// --- Utils & Components ---
import { generateMetadata } from '@/utils/metadata';
import { generateViewport } from '@/utils/viewport';
import AnalyticsInitializer from '@/components/AnalyticsInitializer';
import { Header, Footer } from './landing-page-client';

// --- Styles ---
import './globals.css';

// --- Font Awesome CSS Fix ---
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground font-sans flex flex-col min-h-screen`}>
        <Header />
        <main className='flex-grow'>{children}</main>
        <Footer />
        <AnalyticsInitializer />
      </body>
    </html>
  );
}
