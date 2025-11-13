import { notFound } from 'next/navigation';
import { getDiscoverContentDetail } from '@/lib/data/discover-mock';
import { DiscoverDetailPage } from '@/components/ui/discover-detail-page';

interface DiscoverDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: DiscoverDetailPageProps) {
  const { id } = await params;
  const content = getDiscoverContentDetail(id);

  if (!content) {
    notFound();
  }

  return <DiscoverDetailPage content={content} />;
}
