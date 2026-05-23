import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface LandingSectionProps {
  id?: string
  children: ReactNode
  className?: string
  /** Center content vertically (default true) */
  center?: boolean
  ariaLabelledby?: string
}

export function LandingSection({
  id,
  children,
  className,
  center = true,
  ariaLabelledby,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={cn(
        'landing-section relative w-full min-h-[100dvh] min-h-[100svh] flex flex-col',
        center && 'justify-center',
        className
      )}
    >
      {children}
    </section>
  )
}
