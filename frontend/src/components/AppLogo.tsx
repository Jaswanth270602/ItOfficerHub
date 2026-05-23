import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type AppLogoProps = {
  className?: string
  iconClassName?: string
  textClassName?: string
  showText?: boolean
  to?: string
}

export function AppLogo({
  className,
  iconClassName,
  textClassName,
  showText = true,
  to = '/',
}: AppLogoProps) {
  const inner = (
    <>
      <img
        src="/logo.png"
        alt="ItOfficerHub"
        className={cn('h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shrink-0 ring-1 ring-cyan-500/30', iconClassName)}
        width={40}
        height={40}
      />
      {showText && (
        <span
          className={cn(
            'bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent truncate font-bold',
            textClassName
          )}
        >
          ItOfficerHub
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cn('flex items-center gap-2 shrink-0 min-w-0', className)}>
        {inner}
      </Link>
    )
  }

  return <div className={cn('flex items-center gap-2 shrink-0 min-w-0', className)}>{inner}</div>
}
