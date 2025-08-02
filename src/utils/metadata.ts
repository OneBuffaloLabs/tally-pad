// --- Next ---
import type { Metadata } from 'next';

// Define the structure for page-specific metadata
interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string[]; // Always treat keywords as an array for easier merging
  urlPath?: string; // The path of the page, e.g., "/app"
  robots?: Metadata['robots'];
}

// --- Base Metadata for TallyPad ---
const BASE_URL = 'https://tallypad.onebuffalolabs.com';
const SITE_NAME = 'TallyPad';
const TWITTER_CREATOR = '@onebuffalolabs';
const DEFAULT_TITLE = "TallyPad | The Last Scoresheet You'll Ever Need";
const DEFAULT_DESCRIPTION =
  'TallyPad is a simple, beautiful, and free scorekeeper for all your favorite card and board games. Focus on the fun, not the math.';
const DEFAULT_OG_IMAGE = ''; // No image available yet
const DEFAULT_KEYWORDS = [
  'TallyPad',
  'score keeper',
  'scoresheet',
  'board game scores',
  'card game scores',
  'Yahtzee scoresheet',
  'Phase 10 score',
  'game night tool',
  'score tracker',
  'digital scoresheet',
  'One Buffalo Labs',
];

/**
 * Generates metadata for a page, merging with site-wide defaults.
 * @param pageMeta - Page-specific metadata overrides.
 * @returns A Next.js Metadata object.
 */
export function generateMetadata({
  title,
  description,
  keywords = [], // Default to an empty array
  urlPath = '',
  robots,
}: PageMetadata = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageUrl = `${BASE_URL}${urlPath}`;

  // Combine default and page-specific keywords, ensuring no duplicates
  const allKeywords = [...new Set([...DEFAULT_KEYWORDS, ...keywords])];

  return {
    title: {
      template: `%s | ${SITE_NAME}`,
      default: DEFAULT_TITLE,
    },
    ...(title && { title: title }),
    description: pageDescription,
    keywords: allKeywords,
    ...(robots && { robots: robots }),
    manifest: '/manifest.json',
    appleWebApp: {
      title: SITE_NAME,
      capable: true,
      statusBarStyle: 'black-translucent',
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: SITE_NAME,
      images: DEFAULT_OG_IMAGE
        ? [
            {
              url: DEFAULT_OG_IMAGE,
              width: 1200,
              height: 630,
              alt: `${title || 'TallyPad'} - Digital Scoresheet`,
            },
          ]
        : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      creator: TWITTER_CREATOR,
      images: DEFAULT_OG_IMAGE ? [DEFAULT_OG_IMAGE] : [],
    },
    metadataBase: new URL(BASE_URL),
  };
}
