// --- Next & React Imports ---
import type { Metadata } from 'next';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';
// --- UI Components ---
import { Header, Footer } from '../landing-page-client';

// --- Metadata Generation ---
export const metadata: Metadata = generateMetadata({
  title: 'Terms of Service',
  description:
    'Review the Terms of Service for TallyPad. Understand the conditions of use for our open-source digital scoresheet application.',
  urlPath: '/terms',
});

// --- Terms of Service Page Component ---
export default function TermsOfServicePage() {
  return (
    <div className='bg-background min-h-screen text-foreground font-sans flex flex-col'>
      <Header />

      <main className='flex-grow px-4 py-12 sm:py-16'>
        <div className='max-w-3xl mx-auto prose prose-p:text-foreground/80 prose-li:text-foreground/80 prose-headings:text-secondary prose-h1:text-4xl prose-h1:font-extrabold prose-h2:text-2xl prose-h2:font-bold prose-a:text-primary hover:prose-a:opacity-80'>
          <h1>Terms of Service</h1>
          <p className='lead text-foreground/60'>
            <strong>Effective Date:</strong> August 2, 2025
          </p>

          <p>
            Please read these Terms of Service (&quot;Terms&quot;) carefully before using the
            TallyPad application (the &quot;Service&quot;) operated by One Buffalo Labs
            (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree
            with any part of the terms, then you may not access the Service.
          </p>

          <h2>2. Use License</h2>
          <p>
            TallyPad is an open-source project licensed under the GNU AGPLv3 License. This license
            grants you the freedom to use, study, share, and modify the software.
          </p>
          <ul>
            <li>You are free to run the program for any purpose.</li>
            <li>You have the freedom to modify the program to suit your needs.</li>
            <li>You can redistribute copies to help others.</li>
            <li>
              You are free to distribute copies of your modified versions to others. If you do, you
              must release your modified source code under the same AGPLv3 license.
            </li>
          </ul>
          <p>
            You can view the full license details in our{' '}
            <a
              href='https://github.com/onebuffalolabs/tally-pad/blob/main/LICENSE'
              target='_blank'
              rel='noopener noreferrer'>
              GitHub repository
            </a>
            .
          </p>

          <h2>3. Disclaimer of Warranties</h2>
          <p>
            The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We
            make no warranties, expressed or implied, and hereby disclaim and negate all other
            warranties including, without limitation, implied warranties or conditions of
            merchantability, fitness for a particular purpose, or non-infringement of intellectual
            property or other violation of rights.
          </p>

          <h2>4. Limitation of Liability</h2>
          <p>
            In no event shall One Buffalo Labs or its suppliers be liable for any damages
            (including, without limitation, damages for loss of data or profit, or due to business
            interruption) arising out of the use or inability to use the materials on
            TallyPad&apos;s website, even if we or an authorized representative has been notified
            orally or in writing of the possibility of such damage.
          </p>

          <h2>5. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of
            New York, United States, and you irrevocably submit to the exclusive jurisdiction of the
            courts in that State or location.
          </p>

          <h2>6. Changes to These Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any
            time. We will provide notice of any changes by posting the new Terms of Service on this
            page.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
