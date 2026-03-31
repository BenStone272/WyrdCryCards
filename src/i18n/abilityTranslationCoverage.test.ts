import { describe, expect, it } from 'vitest'
import type { WarcryAbility } from '../types/warcry'
import {
  findMissingAbilityTranslations,
  toTranslationRelativePath,
  type WarcryAbilityTranslation,
} from './abilityTranslationCoverage'

function makeAbility(overrides: Partial<WarcryAbility>): WarcryAbility {
  return {
    _id: 'a1',
    name: 'Rush',
    warband: 'universal',
    cost: 'double',
    description: 'Add 1 to the Move characteristic of this fighter until the end of their activation.',
    runemarks: [],
    ...overrides,
  }
}

function makeTranslation(overrides: Partial<WarcryAbilityTranslation>): WarcryAbilityTranslation {
  return {
    _id: 'a1',
    name: 'Szarza',
    description: 'Dodaj 1 do cechy Ruch tego wojownika do konca jego aktywacji.',
    sourceName: 'Rush',
    sourceDescription: 'Add 1 to the Move characteristic of this fighter until the end of their activation.',
    ...overrides,
  }
}

describe('toTranslationRelativePath', () => {
  it('maps source ability files to Polish companion filenames', () => {
    expect(toTranslationRelativePath('data/chaos/skaven/skaven_abilities.json')).toBe(
      'data/chaos/skaven/skaven_abilities.pl.json',
    )
  })

  it('normalizes Windows separators', () => {
    expect(toTranslationRelativePath('data\\order\\seraphon\\seraphon_abilities.json')).toBe(
      'data/order/seraphon/seraphon_abilities.pl.json',
    )
  })
})

describe('findMissingAbilityTranslations', () => {
  it('treats every source ability as missing when the translation file does not exist', () => {
    const sourceAbilities = [makeAbility({ _id: 'a1', name: 'Rush' }), makeAbility({ _id: 'a2', name: 'Onslaught' })]

    const missing = findMissingAbilityTranslations(sourceAbilities, null)

    expect(missing).toEqual([
      { _id: 'a1', sourceName: 'Rush', missingName: true, missingDescription: true },
      { _id: 'a2', sourceName: 'Onslaught', missingName: true, missingDescription: true },
    ])
  })

  it('reports missing fields for partially translated entries', () => {
    const sourceAbilities = [
      makeAbility({ _id: 'a1', name: 'Rush' }),
      makeAbility({ _id: 'a2', name: 'Onslaught' }),
      makeAbility({ _id: 'a3', name: 'Respite' }),
    ]

    const translatedAbilities = [
      makeTranslation({ _id: 'a1', name: '', description: 'Opis po polsku.' }),
      makeTranslation({ _id: 'a2', name: 'Natarcie', description: '   ' }),
    ]

    const missing = findMissingAbilityTranslations(sourceAbilities, translatedAbilities)

    expect(missing).toEqual([
      { _id: 'a1', sourceName: 'Rush', missingName: true, missingDescription: false },
      { _id: 'a2', sourceName: 'Onslaught', missingName: false, missingDescription: true },
      { _id: 'a3', sourceName: 'Respite', missingName: true, missingDescription: true },
    ])
  })

  it('ignores fully translated entries', () => {
    const sourceAbilities = [makeAbility({ _id: 'a1', name: 'Rush' })]
    const translatedAbilities = [makeTranslation({ _id: 'a1' })]

    expect(findMissingAbilityTranslations(sourceAbilities, translatedAbilities)).toEqual([])
  })
})
