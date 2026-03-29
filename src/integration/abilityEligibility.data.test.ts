import { describe, expect, it } from 'vitest'
import { readWarcryAbilitiesFromFile } from '../data/warcryAbilityFile'
import { readWarcryFightersFromFile } from '../data/warcryFighterFile'
import { isAbilityEligibleForFighter } from './abilityEligibility'

const skavenFightersFile = new URL(
  '../../public/warcry_data/data/chaos/skaven/skaven_fighters.json',
  import.meta.url,
)

const skavenAbilitiesFile = new URL(
  '../../public/warcry_data/data/chaos/skaven/skaven_abilities.json',
  import.meta.url,
)

describe('isAbilityEligibleForFighter with real data', () => {
  it('includes subfaction abilities for Slynk Skittershank', async () => {
    const [fighters, abilities] = await Promise.all([
      readWarcryFightersFromFile(skavenFightersFile),
      readWarcryAbilitiesFromFile(skavenAbilitiesFile),
    ])

    const slynk = fighters.find((fighter) => fighter.name === 'Slynk Skittershank')
    expect(slynk).toBeDefined()

    const eligibleNames = abilities
      .filter((ability) => isAbilityEligibleForFighter(ability, slynk!))
      .map((ability) => ability.name)

    expect(eligibleNames).toContain('Lead From The Back')
    expect(eligibleNames).toContain('Way of the Slinking Rat')
    expect(eligibleNames).toContain('Spitting Cobra Technique')
    expect(eligibleNames).toContain('Way of the Hidden Paw')
  })
})
