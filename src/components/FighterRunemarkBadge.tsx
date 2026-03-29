import { useMemo } from 'react'
import { buildFighterRunemarkCandidates, formatRunemarkLabel } from '../utils/cardHelpers'
import { IconWithFallback } from './IconWithFallback'

type FighterRunemarkBadgeProps = {
  runemark: string
}

export function FighterRunemarkBadge({ runemark }: FighterRunemarkBadgeProps) {
  const candidates = useMemo(() => buildFighterRunemarkCandidates(runemark), [runemark])
  const label = formatRunemarkLabel(runemark)

  return (
    <span className="fighter-runemark-badge" title={label}>
      <IconWithFallback candidates={candidates} alt={label} className="fighter-runemark-icon" />
      <span>{label}</span>
    </span>
  )
}
