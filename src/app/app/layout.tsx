import { ClientDbProvider } from '@/contexts/ClientDbProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ClientDbProvider>{children}</ClientDbProvider>;
}
