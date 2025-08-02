// --- Next & React Imports ---
import type { Metadata } from 'next';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';
// --- UI Components ---
import { Header, Footer } from '../landing-page-client';

// --- Metadata Generation ---
export const metadata: Metadata = generateMetadata({
  title: 'Privacy Policy',
  description:
    'Review the Privacy Policy for TallyPad. Learn how we handle your data with a focus on local storage and user privacy.',
  urlPath: '/privacy',
});

// --- Privacy Policy Page Component ---
export default function PrivacyPolicyPage() {
  return (
    <div className='bg-background min-h-screen text-foreground font-sans flex flex-col'>
      <Header />

      <main className='flex-grow px-4 py-12 sm:py-16'>
        <div className='max-w-3xl mx-auto prose prose-p:text-foreground/80 prose-li:text-foreground/80 prose-headings:text-secondary prose-h1:text-4xl prose-h1:font-extrabold prose-h2:text-2xl prose-h2:font-bold prose-a:text-primary hover:prose-a:opacity-80'>
          <h1>Privacy Policy</h1>
          <p className='lead text-foreground/60'>
            <strong>Effective Date:</strong> August 2, 2025
          </p>

          <p>
            Welcome to TallyPad! Your privacy is critically important to us. This Privacy Policy
            outlines how we handle your information when you use our web application.
          </p>

          <h2>1. Data Storage: All Data Stays With You</h2>
          <p>
            TallyPad is designed with a &quote;privacy-first&quote; approach. All game and score
            data you create is stored locally in your web browser&apos;s Local Storage. We do not
            have a server database to store this information. This means:
          </p>
          <ul>
            <li>We do not collect, see, or have access to the scoresheets you create.</li>
            <li>Your game data is not transmitted to us or any third party.</li>
            <li>
              If you clear your browser&apos;s cache or data, your TallyPad scoresheets will be
              permanently deleted.
            </li>
          </ul>

          <h2>2. Analytics: Anonymous Usage Statistics</h2>
          <p>
            To understand how our users interact with TallyPad and to help us improve the
            application, we use Google Analytics. This service collects anonymous, aggregated data
            about user behavior, such as which features are used most often and the general flow
            through the application.
          </p>
          <ul>
            <li>The data collected is anonymous and cannot be used to identify you personally.</li>
            <li>
              We do not send any personal information or specific game data to Google Analytics.
            </li>
            <li>
              You can learn more about how Google handles data by reviewing their{' '}
              <a
                href='https://policies.google.com/privacy'
                target='_blank'
                rel='noopener noreferrer'>
                Privacy Policy
              </a>
              .
            </li>
          </ul>

          <h2>3. Open Source and Transparency</h2>
          <p>
            TallyPad is an open-source project. We believe in full transparency. You can view the
            entire source code on our{' '}
            <a
              href='https://github.com/onebuffalolabs/tally-pad'
              target='_blank'
              rel='noopener noreferrer'>
              GitHub repository
            </a>
            . This allows anyone to audit our code and verify that we are adhering to this privacy
            policy.
          </p>

          <h2>4. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page. We encourage you to review this page
            periodically for any changes.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please feel free to contact us at{' '}
            <a href='mailto:info@onebuffalolabs.com'>info@onebuffalolabs.com</a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
