import { Construction } from 'lucide-react'
import { PageContainer } from './PageContainer'
import { PageHeader } from './PageHeader'
import { EmptyState } from './EmptyState'

interface PlaceholderPageProps {
  title: string
  description?: string
}

/**
 * Lightweight placeholder used for routes not yet fully implemented.
 * Replaced by the real business screen when ready.
 */
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <PageContainer>
      <PageHeader title={title} />
      <EmptyState
        icon={Construction}
        title="Đang xây dựng"
        description={description ?? 'Màn hình này đang được phát triển.'}
      />
    </PageContainer>
  )
}