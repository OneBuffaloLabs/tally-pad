// --- Helpers ---
import { getChangelogData } from '@/lib/changelog';
// --- Components ---
import ChangelogView from '@/components/changelog/ChangelogView';

export default async function ChangelogPage() {
  const data = await getChangelogData();

  return <ChangelogView data={data} />;
}
