import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { WarbandHeader } from './components/WarbandHeader'
import { FighterCard } from './components/FighterCard'
import { CardBack } from './components/CardBack'
import { LanguagePicker } from './components/LanguagePicker'
import { parseWarcrierRoster } from './import/warcrierImport'
import { isAbilityEligibleForFighter } from './integration/abilityEligibility'
import { mergeAbilityTranslations, toAbilityTranslationPath, type WarcryAbilityTranslation } from './i18n/abilityLocalization'
import { getUiText, type AppLocale } from './i18n/uiText'
import type { WarcryAbility, WarcryFighter, WarcryWeaponProfile } from './types/warcry'
import type { ImportedCard, Manifest, WarbandHeaderInfo } from './types/cards'

type CustomWeapon = {
  Weapon: string
  min_range: string
  max_range: string
  attacks: string
  dmg_hit: string
  dmg_crit: string
  Special?: string
  runemark: string
}

type CustomFighterEntry = Record<string, unknown>
import { findBestFighterMatch, findWarbandEntry, sortAbilitiesByDice } from './utils/cardHelpers'
import './App.css'

function withBasePath(resourcePath: string): string {
  const base = import.meta.env.BASE_URL ?? '/'
  return `${base}${resourcePath.replace(/^\/+/, '')}`
}

const SAMPLE_ROSTER = `Custom
[
  {
    "Name": "Merc",
    "movement": "5",
    "toughness": "3",
    "wounds": "10",
    "fight": "3",
    "shoot": "3",
    "brave": "3",
    "Weapon1": "Warhammer",
    "Weapon2": "",
    "runemarks": "Driven by Greed"
  },
  {
    "Name": "Merc 2",
    "movement": "5",
    "toughness": "3",
    "wounds": "10",
    "fight": "3",
    "shoot": "4",
    "brave": "3",
    "Weapon1": "Dagger",
    "Weapon2": "Crossbow",
    "runemarks": "Driven by Greed,Tough"
  }
]`

const LOCALE_STORAGE_KEY = 'warcryfightercards.locale'
const WARCRIER_WARBANDS_URL = 'https://www.warcrier.net/docs/warbands'
const GITHUB_URL = 'https://github.com/BenStone272/WyrdCryCards'
const DATA_SOURCE_URL = 'https://github.com/krisling049/warcry_data'
const CARD_ASSETS_URL = 'https://github.com/Stevrak/warcry_legions'

function getInitialLocale(): AppLocale {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  return storedLocale === 'pl' ? 'pl' : 'en'
}

function App() {
  const [locale, setLocale] = useState<AppLocale>(getInitialLocale)
  const [printSide, setPrintSide] = useState<'front' | 'back'>('front')
  const [rosterText, setRosterText] = useState('')
  const [lastImportedRosterText, setLastImportedRosterText] = useState<string | null>(null)
  const [rosterName, setRosterName] = useState<string | null>(null)
  const [warbandInfo, setWarbandInfo] = useState<WarbandHeaderInfo | null>(null)
  const [battleTraits, setBattleTraits] = useState<WarcryAbility[]>([])
  const [importedCards, setImportedCards] = useState<ImportedCard[]>([])
  const [importStatus, setImportStatus] = useState('')
  const ui = getUiText(locale)
  const previousLocale = useRef(locale)
  const fighterDataCache = useRef<Record<string, WarcryFighter[]>>({})
  const abilityDataCache = useRef<Record<string, WarcryAbility[]>>({})

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  function useSample() {
    setRosterText(SAMPLE_ROSTER)
  }

  function printCurrentSide() {
    window.print()
  }

  async function loadLocalizedAbilities(abilitiesPath: string): Promise<WarcryAbility[]> {
    const cacheKey = `${locale}:${abilitiesPath}`
    const cached = abilityDataCache.current[cacheKey]
    if (cached) {
      return cached
    }

    const abilitiesResponse = await fetch(withBasePath(abilitiesPath))
    if (!abilitiesResponse.ok) {
      throw new Error(ui.warbandDataLoadError)
    }

    const sourceAbilities = (await abilitiesResponse.json()) as WarcryAbility[]
    const translationPath = toAbilityTranslationPath(abilitiesPath, locale)
    if (!translationPath) {
      abilityDataCache.current[cacheKey] = sourceAbilities
      return sourceAbilities
    }

    let localizedAbilities = sourceAbilities

    try {
      const translationResponse = await fetch(withBasePath(translationPath))
      if (translationResponse.ok) {
        const translatedAbilities = (await translationResponse.json()) as WarcryAbilityTranslation[]
        localizedAbilities = mergeAbilityTranslations(sourceAbilities, translatedAbilities)
      }
    } catch (error) {
      console.warn('Failed to load localized abilities', error)
    }

    abilityDataCache.current[cacheKey] = localizedAbilities
    return localizedAbilities
  }

  async function importRoster(inputText: string) {
    setLastImportedRosterText(inputText)

    const parsed = parseWarcrierRoster(inputText)
    const fighterNames = parsed.fighters.map((fighter) => fighter.name)

    // Debug: log the import start and parsed data
    console.log('IMPORT DEBUG - importRoster called with input:', inputText)
    console.log('IMPORT DEBUG - parsed result:', parsed)
    console.log('IMPORT DEBUG - fighterNames:', fighterNames)

    if (fighterNames.length === 0) {
      setRosterName(null)
      setWarbandInfo(null)
      setBattleTraits([])
      setImportedCards([])
      setImportStatus(ui.noFighterLinesStatus)
      return
    }

    setRosterName(parsed.rosterName)
    setWarbandInfo(null)
    setBattleTraits([])

    try {
      const manifestResponse = await fetch(withBasePath('warcry_data/manifest.json'))
      if (!manifestResponse.ok) {
        throw new Error(ui.manifestLoadError)
      }

      const manifest = (await manifestResponse.json()) as Manifest
      const warbandEntry = findWarbandEntry(manifest, parsed.warband)

      // Custom JSON warband import path (new format): "WarbandName" + JSON array body.
      if (parsed.customWarbandData) {
        setWarbandInfo({
          warbandName: parsed.warband ?? 'custom',
          warbandSlug: (parsed.warband ?? 'custom').toLowerCase(),
          faction: 'custom',
        })
      } else if (!warbandEntry) {
        const unmatchedCards = fighterNames.map((name) => ({
          importedName: name,
          fighter: null,
          abilities: [],
          reactions: [],
        }))
        setImportedCards(unmatchedCards)
        setImportStatus(ui.datasetNotFoundStatus)
        return
      } else {
        setWarbandInfo({
          warbandName: parsed.warband ?? warbandEntry.warbandSlug,
          warbandSlug: warbandEntry.warbandSlug,
          faction: warbandEntry.grandAlliance,
        })
      }

      // Debug: log parsed roster and warband entry to help diagnose matching issues
      // These logs are temporary — remove after debugging.
      console.log('IMPORT DEBUG - parsed roster:', parsed)
      console.log('IMPORT DEBUG - manifest warbandEntry:', warbandEntry)
      let fighters: WarcryFighter[]
      let abilities: WarcryAbility[]

      if (parsed.customWarbandData) {
        const weaponsResponse = await fetch(withBasePath('warcry_data/data/custom/weapons.json'))
        if (!weaponsResponse.ok) {
          throw new Error('Failed to load custom weapons')
        }
        const weaponsData = (await weaponsResponse.json()) as CustomWeapon[]

        const abilitiesResponse = await fetch(withBasePath('warcry_data/data/custom/custom_abilities.json'))
        abilities = []
        if (abilitiesResponse.ok) {
          abilities = (await abilitiesResponse.json()) as WarcryAbility[]
        }

        setBattleTraits(
          sortAbilitiesByDice(
            abilities.filter((ability) => ability.cost.trim().toLowerCase() === 'battletrait'),
          ),
        )

        fighters = parsed.customWarbandData.map((entryRaw) => {
          const entry = entryRaw as CustomFighterEntry
          const fight = Number(entry.fight ?? entry.Fight ?? 3)
          const shoot = Number(entry.shoot ?? entry.Shoot ?? 3)
          const warband = parsed.warband ?? 'custom'
          const runemarksRaw = String(entry.runemarks ?? entry.runemark ?? '').trim()
          const runemarks = runemarksRaw.length ? runemarksRaw.split(/\s*,\s*/g) : []

          const weaponSpecs = ['Weapon1', 'Weapon2', 'Weapon3']
          const weaponProfiles: WarcryWeaponProfile[] = []

          weaponSpecs.forEach((key) => {
            const weaponName = entry[key]
            if (!weaponName || String(weaponName).trim().length === 0) {
              return
            }
            const weaponDef = weaponsData.find((w) => String(w.Weapon).toLowerCase() === String(weaponName).toLowerCase())
            if (weaponDef) {
              const maxRange = Number(weaponDef.max_range ?? 0)
              const strength = maxRange >= 3 ? shoot : fight
              weaponProfiles.push({
                name: String(weaponName).trim(),
                runemark: String(weaponDef.runemark ?? '').trim(),
                attacks: Number(weaponDef.attacks ?? 0),
                strength,
                dmg_hit: Number(weaponDef.dmg_hit ?? 0),
                dmg_crit: Number(weaponDef.dmg_crit ?? 0),
                min_range: Number(weaponDef.min_range ?? 0),
                max_range: maxRange,
                special: String(weaponDef.Special ?? '').trim(),
              })
            }
          })

          const built: WarcryFighter = {
            _id: String(entry._id ?? entry.Name ?? entry.name ?? '').trim().toLowerCase().replace(/\s+/g, '_'),
            name: String(entry.Name ?? entry.name ?? '').trim(),
            warband,
            subfaction: String(entry.subfaction ?? entry.subFaction ?? '').trim(),
            grand_alliance: String(entry.grand_alliance ?? entry.grandAlliance ?? parsed.warband ?? 'custom').toLowerCase(),
            movement: Number(entry.movement ?? entry.Movement ?? 0),
            toughness: Number(entry.toughness ?? entry.Toughness ?? 0),
            wounds: Number(entry.wounds ?? entry.Wounds ?? 0),
            brave: Number(entry.brave ?? entry.Brave ?? 0),
            points: Number(entry.points ?? entry.Points ?? 0),
            runemarks,
            weapons: weaponProfiles,
          }

          // Debug: show each custom fighter after weapon expansion
          console.log('IMPORT DEBUG - built custom fighter:', built._id, built.name, built.weapons)

          return built
        })
      } else {
        const cachedFighters = fighterDataCache.current[warbandEntry!.key]
        const cachedAbilities = abilityDataCache.current[`${locale}:${warbandEntry!.abilitiesPath}`]

        if (cachedFighters && cachedAbilities && warbandEntry!.warbandSlug !== 'custom') {
          fighters = cachedFighters
          abilities = cachedAbilities
        } else {
          if (cachedFighters) {
            fighters = cachedFighters
          } else {
            const fightersResponse = await fetch(withBasePath(warbandEntry!.fightersPath))
            if (!fightersResponse.ok) {
              throw new Error(ui.warbandDataLoadError)
            }

            const rawFighters = (await fightersResponse.json()) as unknown[]
            if (warbandEntry!.warbandSlug === 'custom') {
              const weaponsResponse = await fetch(withBasePath('warcry_data/data/custom/weapons.json'))
              if (!weaponsResponse.ok) {
                throw new Error('Failed to load custom weapons')
              }
              const weaponsData = await weaponsResponse.json() as CustomWeapon[]
              fighters = rawFighters.map((rawFighter) => {
                const f = rawFighter as { fight?: number; shoot?: number; weapons?: Record<string, string> }
                const fight = f.fight ?? 3
                const shoot = f.shoot ?? 3
                const weaponProfiles: WarcryWeaponProfile[] = []
                if (f.weapons && typeof f.weapons === 'object' && !Array.isArray(f.weapons)) {
                  for (const key in f.weapons) {
                    const weaponName = f.weapons[key]
                    const weaponDef = weaponsData.find((w) => w.Weapon === weaponName)
                    if (weaponDef) {
                      const maxRange = parseInt(weaponDef.max_range)
                      weaponProfiles.push({
                        name: String(weaponName).trim(),
                        runemark: weaponDef.runemark,
                        attacks: parseInt(weaponDef.attacks),
                        strength: maxRange >= 3 ? shoot : fight,
                        dmg_hit: parseInt(weaponDef.dmg_hit),
                        dmg_crit: parseInt(weaponDef.dmg_crit),
                        min_range: parseInt(weaponDef.min_range),
                        max_range: maxRange,
                        special: String(weaponDef.Special ?? '').trim(),
                      })
                    }
                  }
                }
                const built = {
                  ...f,
                  weapons: weaponProfiles,
                } as WarcryFighter

                // Debug: show each custom fighter after weapon expansion
                console.log('IMPORT DEBUG - built custom fighter:', built._id, built.name, built.weapons)

                return built
              })
            } else {
              fighters = rawFighters as WarcryFighter[]
            }
            fighterDataCache.current[warbandEntry!.key] = fighters
          }

          abilities = cachedAbilities ?? (await loadLocalizedAbilities(warbandEntry!.abilitiesPath))
        }
      }

      setBattleTraits(
        sortAbilitiesByDice(
          abilities.filter((ability) => ability.cost.trim().toLowerCase() === 'battletrait'),
        ),
      )

      // Debug: log fighters count before attempting matches
      console.log('IMPORT DEBUG - fighters loaded count:', fighters.length)

      const cards: ImportedCard[] = fighterNames.map((name) => {
        const fighter = findBestFighterMatch(fighters, name)
        if (!fighter) {
          // Debug: report unmatched name
          console.log('IMPORT DEBUG - no match for imported name:', name)
          return {
            importedName: name,
            fighter: null,
            abilities: [],
            reactions: [],
          }
        }

        const eligible = abilities.filter((ability) => isAbilityEligibleForFighter(ability, fighter))
        const reactions = sortAbilitiesByDice(
          eligible.filter((ability) => ability.cost.trim().toLowerCase() === 'reaction'),
        )
        const fighterAbilities = sortAbilitiesByDice(
          eligible.filter((ability) => {
            const cost = ability.cost.trim().toLowerCase()
            return cost !== 'reaction' && cost !== 'battletrait'
          }),
        )

        return {
          importedName: name,
          fighter,
          abilities: fighterAbilities,
          reactions,
        }
      })

      setImportedCards(cards)
      const matchedCount = cards.filter((card) => card.fighter).length
      setImportStatus(ui.matchedStatus(matchedCount, cards.length))
    } catch (error) {
      setImportedCards([])
      setRosterName(null)
      setWarbandInfo(null)
      setBattleTraits([])
      setImportStatus(error instanceof Error ? error.message : ui.importFailedStatus)
    }
  }

  const rerunLastImport = useEffectEvent(async () => {
    if (!lastImportedRosterText) {
      return
    }

    await importRoster(lastImportedRosterText)
  })

  useEffect(() => {
    if (previousLocale.current === locale) {
      return
    }

    previousLocale.current = locale
    if (!lastImportedRosterText) {
      return
    }

    void rerunLastImport()
  }, [lastImportedRosterText, locale])

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-header-top">
          <div className="app-header-copy">
            <h1>{ui.appTitle}</h1>
            <p>{ui.appDescription}</p>
  
          </div>

          <div className="app-header-actions">
            <a
              className="app-github-link"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="View source on GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
            <LanguagePicker locale={locale} onSelect={setLocale} ui={ui} />
          </div>
        </div>
      </header>

      <section className="roster-import">
        <p className="roster-title">{ui.rosterTitle}</p>
        <div className="roster-input-shell">
          <textarea
            rows={10}
            value={rosterText}
            onChange={(event) => setRosterText(event.target.value)}
            placeholder={ui.rosterPlaceholder}
          />
          <div className="roster-input-actions">
            <button type="button" className="roster-action-button" onClick={() => void importRoster(rosterText)}>
              {ui.importRosterButton}
            </button>
            <button type="button" className="roster-action-button roster-action-button-secondary" onClick={useSample}>
              {ui.useSampleButton}
            </button>
          </div>
        </div>
        {importedCards.length > 0 && (
          <div className="print-controls" role="group" aria-label={ui.printControlsAriaLabel}>
            <span className="print-controls-label">{ui.printSideLabel}</span>
            <button
              type="button"
              className={`print-mode-toggle ${printSide === 'front' ? 'is-active' : ''}`}
              onClick={() => setPrintSide('front')}
              aria-pressed={printSide === 'front'}
            >
              {ui.frontsLabel}
            </button>
            <button
              type="button"
              className={`print-mode-toggle ${printSide === 'back' ? 'is-active' : ''}`}
              onClick={() => setPrintSide('back')}
              aria-pressed={printSide === 'back'}
            >
              {ui.backsLabel}
            </button>
            <button type="button" className="print-now-button" onClick={printCurrentSide}>
              {printSide === 'front' ? ui.printFrontsButton : ui.printBacksButton}
            </button>
          </div>
        )}
        {importStatus && <p className="status">{importStatus}</p>}
      </section>

      {(rosterName || warbandInfo) && (
        <section className="cards-grid">
          <WarbandHeader rosterName={rosterName} warbandInfo={warbandInfo} battleTraits={battleTraits} locale={locale} ui={ui} />
        </section>
      )}

      {importedCards.length > 0 && (
        <section className={`cards-grid ${printSide === 'back' ? 'cards-grid-backs' : ''}`}>
          {importedCards.map((card, index) =>
            printSide === 'front' ? (
              <FighterCard
                key={`${card.importedName}-${index}`}
                card={card}
                runemarkPlacement="under-name"
                ui={ui}
                onTogglePrintSide={() => setPrintSide('back')}
              />
            ) : (
              <CardBack
                key={`${card.importedName}-${index}`}
                card={card}
                ui={ui}
                onTogglePrintSide={() => setPrintSide('front')}
              />
            ),
          )}
        </section>
      )}
      <footer className="app-credits">
        <span>Author: <a href="https://cyberdynesystems.cc/" target="_blank" rel="noreferrer">Cyberdyne Systems</a></span>
        <span>Fighter &amp; ability data: <a href={DATA_SOURCE_URL} target="_blank" rel="noreferrer">krisling049/warcry_data</a></span>
        <span>Card assets &amp; runemarks: <a href={CARD_ASSETS_URL} target="_blank" rel="noreferrer">Stevrak/warcry_legions</a></span>
      </footer>
    </main>
  )
}

export default App
