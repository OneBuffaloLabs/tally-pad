import { DbProvider } from '@/contexts/DbContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DbProvider>{children}</DbProvider>;
}

