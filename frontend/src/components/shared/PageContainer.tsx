import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

/**
 * Standard page wrapper that provides consistent horizontal padding
 * and a maximum content width for 1440px desktop targets.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[1280px] px-6 py-6', className)}>
      {children}
    </div>
  )
}