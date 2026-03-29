import type { WarcryAbility, WarcryFighter } from './warcry'

export type WarbandManifest = {
  key: string
  grandAlliance: string
  warbandSlug: string
  fightersPath: string
  abilitiesPath: string
}

export type Manifest = {
  warbands: WarbandManifest[]
}

export type ImportedCard = {
  importedName: string
  fighter: WarcryFighter | null
  abilities: WarcryAbility[]
  reactions: WarcryAbility[]
}

export type WarbandHeaderInfo = {
  warbandName: string
  warbandSlug: string
  faction: string
}
