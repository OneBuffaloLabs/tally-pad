// --- Next ---
import type { Metadata } from 'next';

// Define the structure for page-specific metadata
interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string[]; // Always treat keywords as an array for easier merging
  urlPath?: string; // The path of the page, e.g., "/hubs"
  robots?: Metadata['robots'];
}

// --- Base Metadata for One Buffalo Games ---
const BASE_URL = 'https://www.onebuffalogames.com';
const SITE_NAME = 'One Buffalo Games';
const TWITTER_CREATOR = '@onebuffalolabs';
const DEFAULT_TITLE = 'One Buffalo Games | Game Hubs, Tools & Arcade Fun';
const DEFAULT_DESCRIPTION =
  'Find gaming tools, information hubs, and playable web games at One Buffalo Games. Your source for everything from stats to retro arcade fun.';
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/logos/top-text/one-buffalo-cartoon-top-text-white.png`;
const DEFAULT_KEYWORDS = [
  'One Buffalo Games',
  'gaming tools',
  'gaming hubs',
  'game information',
  'game stats',
  'stat trackers',
  'loadout builders',
  'interactive maps',
  'web games',
  'arcade games',
  'retro games',
  'Tower Defense',
  'COD RCG',
  'Halo tools',
  'Battlefield info',
  'video game news',
  'Buffalo NY gaming',
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
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${title || 'One Buffalo Games'} - Gaming Tools and Hubs`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      creator: TWITTER_CREATOR,
      images: [DEFAULT_OG_IMAGE],
    },
    metadataBase: new URL(BASE_URL),
    other: {
      'google-adsense-account': 'ca-pub-9488377852201328',
    },
  };
}
