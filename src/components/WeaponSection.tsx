import type { WarcryWeaponProfile } from '../types/warcry'
import {
  buildWeaponRunemarkCandidates,
  characteristicIconPath,
  formatRunemarkLabel,
  formatWeaponDamage,
  formatWeaponRange,
} from '../utils/cardHelpers'
import { IconWithFallback } from './IconWithFallback'

type WeaponSectionProps = {
  fighterId: string
  weapons: WarcryWeaponProfile[]
}

export function WeaponSection({ fighterId, weapons }: WeaponSectionProps) {
  return (
    <section>
      <h3>Weapons</h3>
      <ul className="weapons-showcase-list">
        {weapons.length === 0 ? (
          <li className="weapon-showcase-empty">No weapon profiles</li>
        ) : (
          weapons.map((weapon, idx) => (
            <li key={`${fighterId}-weapon-${idx}`} className="weapon-showcase-row">
              <div className="weapon-cell weapon-cell-type">
                <IconWithFallback
                  key={buildWeaponRunemarkCandidates(weapon.runemark).join('|')}
                  candidates={buildWeaponRunemarkCandidates(weapon.runemark)}
                  alt={`${weapon.runemark} weapon`}
                  className="weapon-type-icon"
                />
                <span className="weapon-type-label">{formatRunemarkLabel(weapon.runemark)}</span>
              </div>

              <div className="weapon-cell">
                <img className="weapon-stat-icon" src={characteristicIconPath('range')} alt="Range" />
                <span className="weapon-stat-value">{formatWeaponRange(weapon)}</span>
              </div>

              <div className="weapon-cell">
                <img className="weapon-stat-icon" src={characteristicIconPath('attacks')} alt="Attacks" />
                <span className="weapon-stat-value">{weapon.attacks}</span>
              </div>

              <div className="weapon-cell">
                <img className="weapon-stat-icon" src={characteristicIconPath('strength')} alt="Strength" />
                <span className="weapon-stat-value">{weapon.strength}</span>
              </div>

              <div className="weapon-cell">
                <img className="weapon-stat-icon" src={characteristicIconPath('damage')} alt="Damage" />
                <span className="weapon-stat-value">{formatWeaponDamage(weapon)}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
