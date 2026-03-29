import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiceD6, faStar } from '@fortawesome/free-solid-svg-icons'
import type { WarcryAbility } from '../types/warcry'
import { getAbilityCostVisual } from '../utils/cardHelpers'

type AbilitySectionProps = {
  abilities: WarcryAbility[]
}

export function AbilitySection({ abilities }: AbilitySectionProps) {
  return (
    <section>
      <h3>Abilities</h3>
      <ul className="abilities-list">
        {abilities.length === 0 ? (
          <li>No matching abilities</li>
        ) : (
          abilities.map((ability) => {
            const costVisual = getAbilityCostVisual(ability.cost)
            return (
              <li key={ability._id} className="ability-line">
                <span className="ability-cost-slot">
                  {costVisual && !costVisual.isPassive && (
                    <span className="dice-group" aria-label={costVisual.label} title={costVisual.label}>
                      {Array.from({ length: costVisual.diceCount }).map((_, index) => (
                        <FontAwesomeIcon key={index} icon={faDiceD6} className="dice-icon" />
                      ))}
                    </span>
                  )}
                  {costVisual?.isPassive && (
                    <span className="passive-badge" aria-label="Passive" title="Passive">
                      <FontAwesomeIcon icon={faStar} className="passive-icon" />
                    </span>
                  )}
                </span>
                <span className="ability-name">{ability.name}</span>
              </li>
            )
          })
        )}
      </ul>
    </section>
  )
}
