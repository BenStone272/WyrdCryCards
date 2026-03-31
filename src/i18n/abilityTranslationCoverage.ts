import type { WarcryAbility } from '../types/warcry'

export type WarcryAbilityTranslation = Pick<WarcryAbility, '_id' | 'name' | 'description'> & {
  sourceName?: string
  sourceDescription?: string
}

export type MissingAbilityTranslation = {
  _id: string
  sourceName: string
  missingName: boolean
  missingDescription: boolean
}

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim().length === 0
}

export function toTranslationRelativePath(sourceRelativePath: string, locale = 'pl'): string {
  const normalized = sourceRelativePath.replaceAll('\\', '/')

  if (!normalized.startsWith('data/')) {
    throw new Error(`Expected source ability path under data/: ${sourceRelativePath}`)
  }

  if (!normalized.endsWith('_abilities.json')) {
    throw new Error(`Expected source ability filename ending with _abilities.json: ${sourceRelativePath}`)
  }

  return normalized.replace(/_abilities\.json$/, `_abilities.${locale}.json`)
}

export function findMissingAbilityTranslations(
  sourceAbilities: WarcryAbility[],
  translatedAbilities: WarcryAbilityTranslation[] | null,
): MissingAbilityTranslation[] {
  const translatedById = new Map(translatedAbilities?.map((ability) => [ability._id, ability]) ?? [])

  return sourceAbilities.flatMap((sourceAbility) => {
    const translatedAbility = translatedById.get(sourceAbility._id)
    if (!translatedAbility) {
      return [
        {
          _id: sourceAbility._id,
          sourceName: sourceAbility.name,
          missingName: true,
          missingDescription: true,
        },
      ]
    }

    const missingName = isBlank(translatedAbility.name)
    const missingDescription = isBlank(translatedAbility.description)

    if (!missingName && !missingDescription) {
      return []
    }

    return [
      {
        _id: sourceAbility._id,
        sourceName: sourceAbility.name,
        missingName,
        missingDescription,
      },
    ]
  })
}
