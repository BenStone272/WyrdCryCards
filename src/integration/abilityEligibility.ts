import type { WarcryAbility, WarcryFighter } from '../types/warcry'

function normalizeName(value: string): string {
  return value.trim().toLowerCase()
}

export function isAbilityEligibleForFighter(
  ability: WarcryAbility,
  fighter: WarcryFighter,
): boolean {
  const abilityWarband = normalizeName(ability.warband)
  const fighterWarband = normalizeName(fighter.warband)
  const fighterSubfaction = normalizeName(fighter.subfaction)

  const warbandMatches = abilityWarband === fighterWarband || abilityWarband === fighterSubfaction
  if (!warbandMatches) {
    return false
  }

  if (!ability.runemarks || ability.runemarks.length === 0) {
    return true
  }

  return ability.runemarks.every((runemark) => fighter.runemarks.includes(runemark))
}
