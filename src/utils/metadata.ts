// --- Next ---
import type { Metadata } from 'next';

// Define the structure for page-specific metadata
interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  urlPath?: string;
  imageUrl?: string;
  robots?: Metadata['robots'];
}

// --- Base Metadata for TallyPad ---
const BASE_URL = 'https://tallypad.onebuffalolabs.com';
const SITE_NAME = 'TallyPad';
const TWITTER_CREATOR = '@onebuffalolabs';
const GOOGLE_ADSENSE_ACCOUNT = 'ca-pub-9488377852201328';
const DEFAULT_TITLE = "TallyPad | The Last Scoresheet You'll Ever Need";
const DEFAULT_DESCRIPTION =
  'TallyPad is a simple, beautiful, and free scorekeeper for all your favorite card and board games. Focus on the fun, not the math.';
const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/logos/tally-pad.png`;
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
 */
export function generateMetadata({
  title,
  description,
  keywords = [],
  urlPath = '',
  imageUrl,
  robots,
}: PageMetadata = {}): Metadata {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageUrl = `${BASE_URL}${urlPath}`;
  const allKeywords = [...new Set([...DEFAULT_KEYWORDS, ...keywords])];
  const ogImageUrl = imageUrl ? `${BASE_URL}${imageUrl}` : DEFAULT_OG_IMAGE;
  const otherMetadata: Metadata['other'] = {};
  if (GOOGLE_ADSENSE_ACCOUNT) {
    otherMetadata['google-adsense-account'] = GOOGLE_ADSENSE_ACCOUNT;
  }

  const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: pageUrl,
    },
    title: {
      template: `%s | ${SITE_NAME}`,
      default: DEFAULT_TITLE,
    },
    ...(title && { title: title }),
    description: pageDescription,
    keywords: allKeywords,
    ...(robots && { robots: robots }),
    manifest: '/manifest.json',
    icons: {
      icon: [
        // SVG icon for modern browsers
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
        // PNG icon as a fallback
        { url: '/icon.png', type: 'image/png' },
      ],
      // Apple touch icon for iOS devices
      apple: '/apple-icon.png',
    },
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
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title || 'TallyPad'} - Digital Scoresheet`,
          type: 'image/png',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    ...(Object.keys(otherMetadata).length > 0 && { other: otherMetadata }),
  };

  if (TWITTER_CREATOR) {
    metadata.twitter = {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      creator: TWITTER_CREATOR,
      images: [ogImageUrl],
    };
  }

  return metadata;
}
