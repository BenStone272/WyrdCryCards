export const APP_LOCALES = ['en', 'pl'] as const

export type AppLocale = (typeof APP_LOCALES)[number]

export type LocaleOption = {
  code: AppLocale
  shortCode: string
  nativeName: string
  englishName: string
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  {
    code: 'en',
    shortCode: 'EN',
    nativeName: 'English',
    englishName: 'English',
  },
  {
    code: 'pl',
    shortCode: 'PL',
    nativeName: 'Polski',
    englishName: 'Polish',
  },
]

export type UiText = {
  appTitle: string
  appDescription: string
  appWarcrierLinkLabel: string
  languageLabel: string
  languagePickerAriaLabel: string
  languageHelpText: string
  englishLabel: string
  polishLabel: string
  rosterTitle: string
  rosterBuilderTitle: string
  rosterBuilderDescription: string
  warbandSelectLabel: string
  warbandSelectPlaceholder: string
  fighterSelectLabel: string
  fighterSelectPlaceholder: string
  addSelectedFighterButton: string
  clearSelectedFightersButton: string
  importSelectedFightersButton: string
  selectedFightersLabel: string
  noSelectedFighters: string
  loadingWarbandFighters: string
  builderLoadFailed: string
  rosterPlaceholder: string
  importRosterButton: string
  saveRosterButton: string
  loadRosterButton: string
  useSampleButton: string
  printControlsAriaLabel: string
  printSideLabel: string
  frontsLabel: string
  backsLabel: string
  editModeOnLabel: string
  editModeOffLabel: string
  printFrontsButton: string
  printBacksButton: string
  noFighterLinesStatus: string
  manifestLoadError: string
  datasetNotFoundStatus: string
  warbandDataLoadError: string
  importFailedStatus: string
  rosterSavedStatus: string
  noSavedRosterStatus: string
  importedRosterFallback: string
  battleTraitsHeading: string
  noBattleTraits: string
  statsHeading: string
  weaponsHeading: string
  weaponLabel: string
  noWeaponProfiles: string
  abilitiesHeading: string
  noMatchingAbilities: string
  noMatchingAbilitiesBack: string
  reactionsHeading: string
  noMatchingReactions: string
  noRunemarks: string
  unmatchedFighter: string
  runemarkLabel: string
  totalPointsLabel: (points: number) => string
  pointsUnit: string
  moveLabel: string
  toughnessLabel: string
  woundsLabel: string
  braveLabel: string
  rangeLabel: string
  attacksLabel: string
  strengthLabel: string
  damageLabel: string
  abilityCostLabels: {
    double: string
    triple: string
    quad: string
    passive: string
    trait: string
  }
  matchedStatus: (matchedCount: number, totalCount: number) => string
  pointsAriaLabel: (points: number) => string
  cardBackAriaLabel: (fighterName: string) => string
}

const uiText: Record<AppLocale, UiText> = {
  en: {
    appTitle: 'WyrdCry Fighter Cards',
    appDescription: 'Paste a JSON roster to generate printable fighter cards.',
    appWarcrierLinkLabel: 'Create a band on Warcrier',
    languageLabel: 'Language',
    languagePickerAriaLabel: 'Language picker',
    languageHelpText: 'Changes the interface and ability text.',
    englishLabel: 'English',
    polishLabel: 'Polski',
    rosterTitle: 'Roster Text',
    rosterBuilderTitle: 'Roster Builder',
    rosterBuilderDescription: 'Pick a warband, add fighters, and generate cards without pasting roster text.',
    warbandSelectLabel: 'Warband',
    warbandSelectPlaceholder: 'Select a warband',
    fighterSelectLabel: 'Fighter',
    fighterSelectPlaceholder: 'Select a fighter',
    addSelectedFighterButton: 'Add fighter',
    clearSelectedFightersButton: 'Clear fighters',
    importSelectedFightersButton: 'Import selected fighters',
    selectedFightersLabel: 'Selected fighters',
    noSelectedFighters: 'No fighters selected yet.',
    loadingWarbandFighters: 'Loading fighters…',
    builderLoadFailed: 'Failed to load fighters for the selected warband.',
    rosterPlaceholder: 'Paste full roster export text here',
    importRosterButton: 'Import roster',
    saveRosterButton: 'Save roster',
    loadRosterButton: 'Load roster',
    useSampleButton: 'Use Sample',
    printControlsAriaLabel: 'Print controls',
    printSideLabel: 'Print side:',
    frontsLabel: 'Fronts',
    backsLabel: 'Backs',
    editModeOnLabel: 'Edit mode: On',
    editModeOffLabel: 'Edit mode: Off',
    printFrontsButton: 'Print fronts',
    printBacksButton: 'Print backs',
    noFighterLinesStatus: 'No fighter lines found. Paste the full roster export block.',
    manifestLoadError: 'Failed to load warband manifest',
    datasetNotFoundStatus: 'Roster imported, but warband data was not found in local dataset.',
    warbandDataLoadError: 'Failed to load fighters/abilities for detected warband',
    importFailedStatus: 'Import failed',
    rosterSavedStatus: 'Roster saved locally.',
    noSavedRosterStatus: 'No saved roster found on this device.',
    importedRosterFallback: 'Imported Roster',
    battleTraitsHeading: 'Battle Traits',
    noBattleTraits: 'No battle traits',
    statsHeading: 'Stats',
    weaponsHeading: 'Weapons',
    weaponLabel: 'weapon',
    noWeaponProfiles: 'No weapon profiles',
    abilitiesHeading: 'Abilities',
    noMatchingAbilities: 'No matching abilities',
    noMatchingAbilitiesBack: 'No matching abilities.',
    reactionsHeading: 'Reactions',
    noMatchingReactions: 'No matching reactions',
    noRunemarks: 'No runemarks',
    unmatchedFighter: 'No fighter data match found in detected warband.',
    runemarkLabel: 'runemark',
    totalPointsLabel: (points) => `Total points: ${points}`,
    pointsUnit: 'pts',
    moveLabel: 'Move',
    toughnessLabel: 'Toughness',
    woundsLabel: 'Wounds',
    braveLabel: 'Brave',
    rangeLabel: 'Range',
    attacksLabel: 'Attacks',
    strengthLabel: 'Strength',
    damageLabel: 'Damage',
    abilityCostLabels: {
      double: 'Double',
      triple: 'Triple',
      quad: 'Quad',
      passive: 'Passive',
      trait: 'Trait',
    },
    matchedStatus: (matchedCount, totalCount) => `Roster imported: matched ${matchedCount}/${totalCount}`,
    pointsAriaLabel: (points) => `${points} points`,
    cardBackAriaLabel: (fighterName) => `Back of ${fighterName}`,
  },
  pl: {
    appTitle: 'Warcry Fighter Cards',
    appDescription: 'Wklej eksport rozpiski z Warcrier, aby wygenerować karty wojowników do druku.',
    appWarcrierLinkLabel: 'Utwórz bandę w Warcrier',
    languageLabel: 'Język',
    languagePickerAriaLabel: 'Wybór języka',
    languageHelpText: 'Zmienia interfejs i tekst zdolności.',
    englishLabel: 'English',
    polishLabel: 'Polski',
    rosterTitle: 'Tekst rozpiski',
    rosterBuilderTitle: 'Konstruktor rozpiski',
    rosterBuilderDescription: 'Wybierz warband, dodaj wojowników i wygeneruj karty bez wklejania eksportu.',
    warbandSelectLabel: 'Warband',
    warbandSelectPlaceholder: 'Wybierz warband',
    fighterSelectLabel: 'Wojownik',
    fighterSelectPlaceholder: 'Wybierz wojownika',
    addSelectedFighterButton: 'Dodaj wojownika',
    clearSelectedFightersButton: 'Wyczyść wojowników',
    importSelectedFightersButton: 'Importuj wybranych wojowników',
    selectedFightersLabel: 'Wybrani wojownicy',
    noSelectedFighters: 'Nie wybrano jeszcze żadnych wojowników.',
    loadingWarbandFighters: 'Wczytywanie wojowników…',
    builderLoadFailed: 'Nie udało się wczytać wojowników dla wybranego warbandu.',
    rosterPlaceholder: 'Wklej pełny eksport rozpiski tutaj',
    importRosterButton: 'Importuj rozpiskę',
    saveRosterButton: 'Zapisz rozpiskę',
    loadRosterButton: 'Wczytaj rozpiskę',
    useSampleButton: 'Użyj przykładu',
    printControlsAriaLabel: 'Ustawienia wydruku',
    printSideLabel: 'Strona wydruku:',
    frontsLabel: 'Przody',
    backsLabel: 'Tyły',
    editModeOnLabel: 'Tryb edycji: Włączony',
    editModeOffLabel: 'Tryb edycji: Wyłączony',
    printFrontsButton: 'Drukuj przody',
    printBacksButton: 'Drukuj tyły',
    noFighterLinesStatus: 'Nie znaleziono linii wojowników. Wklej pełny blok eksportu.',
    manifestLoadError: 'Nie udało się wczytać manifestu warbandów.',
    datasetNotFoundStatus: 'Rozpiska została zaimportowana, ale nie znaleziono danych warbandu w lokalnym zbiorze.',
    warbandDataLoadError: 'Nie udało się wczytać wojowników i zdolności dla wykrytego warbandu.',
    importFailedStatus: 'Import nie powiódł się',
    rosterSavedStatus: 'Rozpiska zapisana lokalnie.',
    noSavedRosterStatus: 'Brak zapisanej rozpiski na tym urządzeniu.',
    importedRosterFallback: 'Zaimportowana rozpiska',
    battleTraitsHeading: 'Cechy bitewne',
    noBattleTraits: 'Brak cech bitewnych',
    statsHeading: 'Statystyki',
    weaponsHeading: 'Broń',
    weaponLabel: 'broń',
    noWeaponProfiles: 'Brak profili broni',
    abilitiesHeading: 'Zdolności',
    noMatchingAbilities: 'Brak pasujących zdolności',
    noMatchingAbilitiesBack: 'Brak pasujących zdolności.',
    reactionsHeading: 'Reakcje',
    noMatchingReactions: 'Brak pasujących reakcji',
    noRunemarks: 'Brak runemarków',
    unmatchedFighter: 'Nie znaleziono danych wojownika w wykrytym warbandzie.',
    runemarkLabel: 'runemark',
    totalPointsLabel: (points) => `Suma punktów: ${points}`,
    pointsUnit: 'pkt',
    moveLabel: 'Ruch',
    toughnessLabel: 'Wytrzymałość',
    woundsLabel: 'Rany',
    braveLabel: 'Odwaga',
    rangeLabel: 'Zasięg',
    attacksLabel: 'Ataki',
    strengthLabel: 'Siła',
    damageLabel: 'Obrażenia',
    abilityCostLabels: {
      double: 'Dublet',
      triple: 'Tryplet',
      quad: 'Kwadruplet',
      passive: 'Pasywna',      trait: 'Cecha',    },
    matchedStatus: (matchedCount, totalCount) => `Zaimportowano rozpiskę: dopasowano ${matchedCount}/${totalCount}`,
    pointsAriaLabel: (points) => `${points} punktów`,
    cardBackAriaLabel: (fighterName) => `Tył karty ${fighterName}`,
  },
}

const grandAllianceLabels: Record<AppLocale, Record<string, string>> = {
  en: {
    chaos: 'Chaos',
    death: 'Death',
    destruction: 'Destruction',
    order: 'Order',
    universal: 'Universal',
  },
  pl: {
    chaos: 'Chaos',
    death: 'Śmierć',
    destruction: 'Zniszczenie',
    order: 'Porządek',
    universal: 'Uniwersalne',
  },
}

export function getUiText(locale: AppLocale): UiText {
  return uiText[locale]
}

export function formatGrandAllianceLabel(value: string, locale: AppLocale): string {
  const normalized = value.trim().toLowerCase()
  const translated = grandAllianceLabels[locale][normalized]
  if (translated) {
    return translated
  }

  if (value.length === 0) {
    return value
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}
