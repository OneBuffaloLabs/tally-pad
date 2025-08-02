import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center text-center px-4 py-20'>
      <FontAwesomeIcon icon={faQuestionCircle} className='text-accent mb-6' size='4x' />
      <h1 className='text-6xl font-extrabold text-secondary'>404</h1>
      <h2 className='text-2xl font-semibold text-foreground mt-2'>Page Not Found</h2>
      <p className='mt-4 text-lg text-foreground/70 max-w-md mx-auto'>
        Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or
        deleted.
      </p>
      <Link
        href='/'
        className='mt-8 inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-full text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-transform'>
        <FontAwesomeIcon icon={faArrowLeft} className='w-4 h-4' />
        Go Back Home
      </Link>
    </div>
  );
}
