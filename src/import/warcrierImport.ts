export type ImportedFighter = {
  name: string
  fighterId?: string
}

export type ImportedRoster = {
  rosterName: string | null
  warband: string | null
  fighters: ImportedFighter[]
  customWarbandData?: unknown[]
}

export function extractDelimitedContent(input: string): string {
  const lines = input.split(/\r?\n/)
  const delimiterIndexes: number[] = []

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === '----------') {
      delimiterIndexes.push(i)
    }
  }

  if (delimiterIndexes.length < 2) {
    return input
  }

  const start = delimiterIndexes[0] + 1
  const end = delimiterIndexes[1]
  return lines.slice(start, end).join('\n')
}

function parseFighterLine(line: string): ImportedFighter | null {
  if (!line.startsWith('- ')) {
    return null
  }

  const withoutBullet = line.replace(/^[-]\s+/, '')
  const fighterIdMatch = withoutBullet.match(/\s+\{id:([^}]+)\}$/)
  const fighterId = fighterIdMatch?.[1]?.trim()
  const lineWithoutId = fighterIdMatch
    ? withoutBullet.slice(0, Math.max(0, fighterIdMatch.index ?? withoutBullet.length)).trimEnd()
    : withoutBullet
  const match = lineWithoutId.match(/^(.+?)(?:\s+\([^)]*\))?$/)
  if (!match) {
    return null
  }

  const name = match[1].trim()
  return fighterId ? { name, fighterId } : { name }
}

export function parseWarcrierRoster(input: string): ImportedRoster {
  const content = extractDelimitedContent(input).trim()
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  // Custom format: warband name, then JSON array of fighter definitions
  if (lines.length >= 2 && lines[1] === '[') {
    const warband = lines[0]
    const jsonStart = content.indexOf('[')
    if (jsonStart !== -1) {
      try {
        const payload = JSON.parse(content.substring(jsonStart))
        if (Array.isArray(payload)) {
          const fighters = payload
            .map((entryRaw) => {
              const entry = entryRaw as Record<string, unknown>
              const name = String(entry.Name ?? entry.name ?? '').trim()
              return name ? { name } : null
            })
            .filter((item): item is ImportedFighter => item !== null)

          return {
            rosterName: null,
            warband,
            fighters,
            customWarbandData: payload,
          }
        }
      } catch {
        // fall through to standard parser if invalid JSON
      }
    }
  }

  let rosterName: string | null = null
  let warband: string | null = null

  const fighters: ImportedFighter[] = []

  for (const line of lines) {
    if (line.startsWith('"') && line.endsWith('"')) {
      rosterName = line.slice(1, -1).trim()
      continue
    }

    const fighter = parseFighterLine(line)
    if (fighter) {
      fighters.push(fighter)
      continue
    }

    if (!warband) {
      warband = line
    }
  }

  return {
    rosterName,
    warband,
    fighters,
  }
}