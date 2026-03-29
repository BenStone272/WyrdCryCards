import { useMemo } from 'react'
import type { WarcryAbility } from '../types/warcry'
import type { WarbandHeaderInfo } from '../types/cards'
import { buildFactionRunemarkCandidates } from '../utils/cardHelpers'
import { IconWithFallback } from './IconWithFallback'

type WarbandHeaderProps = {
  rosterName: string | null
  warbandInfo: WarbandHeaderInfo | null
  battleTraits: WarcryAbility[]
}

export function WarbandHeader({ rosterName, warbandInfo, battleTraits }: WarbandHeaderProps) {
  const runemarkCandidates = useMemo(
    () => (warbandInfo ? buildFactionRunemarkCandidates(warbandInfo) : []),
    [warbandInfo],
  )

  if (!rosterName && !warbandInfo) {
    return null
  }

  return (
    <article className="warband-header-card">
      <div className="warband-header-top">
        <div>
          <h2>{rosterName || 'Imported Roster'}</h2>
          {warbandInfo && (
            <p>
              {warbandInfo.warbandName} | {warbandInfo.faction}
            </p>
          )}
        </div>
        {warbandInfo && (
          <IconWithFallback
            key={runemarkCandidates.join('|')}
            candidates={runemarkCandidates}
            alt={`${warbandInfo.warbandName} runemark`}
            className="faction-runemark"
          />
        )}
      </div>

      <section className="warband-traits">
        <h3>Battle Traits</h3>
        <ul className="abilities-list">
          {battleTraits.length === 0 ? (
            <li>No battle traits</li>
          ) : (
            battleTraits.map((ability) => <li key={ability._id}>{ability.name}</li>)
          )}
        </ul>
      </section>
    </article>
  )
}
