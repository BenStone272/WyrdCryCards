import { useEffect, useRef, useState } from 'react'
import type { UiText } from '../i18n/uiText'
import type { ImportedCard } from '../types/cards'
import { characteristicIconPath, withBasePath } from '../utils/cardHelpers'
import { AbilitySection } from './AbilitySection'
import { WeaponSection } from './WeaponSection'
import { deletePhoto, loadPhoto, savePhoto } from '../utils/photoStore'

type FighterCardProps = {
  card: ImportedCard
  runemarkPlacement: 'under-name' | 'bottom'
  ui: UiText
  onTogglePrintSide?: () => void
}

export function FighterCard({ card, ui, onTogglePrintSide }: FighterCardProps) {
  const fighterName = card.fighter?.name ?? card.importedName
  const photoKey = card.cardKey

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const displayedUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!photoKey) return
    let cancelled = false

    void loadPhoto(photoKey)
      .then((url) => {
        if (cancelled) {
          if (url) URL.revokeObjectURL(url)
          return
        }
        displayedUrlRef.current = url
        setPhotoUrl(url)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [photoKey])

  useEffect(() => {
    return () => {
      if (displayedUrlRef.current) {
        URL.revokeObjectURL(displayedUrlRef.current)
        displayedUrlRef.current = null
      }
    }
  }, [])

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !photoKey) return
    try {
      const url = await savePhoto(photoKey, file)
      if (displayedUrlRef.current) URL.revokeObjectURL(displayedUrlRef.current)
      displayedUrlRef.current = url
      setPhotoUrl(url)
    } catch (err) {
      console.warn('Failed to save photo', err)
    }
    event.target.value = ''
  }

  async function handleRemovePhoto() {
    if (!photoKey) return
    await deletePhoto(photoKey)
    if (displayedUrlRef.current) URL.revokeObjectURL(displayedUrlRef.current)
    displayedUrlRef.current = null
    setPhotoUrl(null)
  }

  return (
    <article
      className="fighter-card"
      role="button"
      tabIndex={0}
      onClick={() => onTogglePrintSide?.()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onTogglePrintSide?.()
        }
      }}
      aria-label={fighterName}
    >
      <div className="fighter-card-photo-area">
        {photoUrl ? (
          <img className="fighter-card-photo-img" src={photoUrl} alt={fighterName} />
        ) : (
          <div className="fighter-card-photo-placeholder" />
        )}
        <div className="fighter-card-photo-controls no-print">
          <button
            type="button"
            className="photo-upload-btn"
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            aria-label={`Upload photo for ${fighterName}`}
          >
            {photoUrl ? '↺' : '+'}
          </button>
          {photoUrl && (
            <button
              type="button"
              className="photo-remove-btn"
              onClick={(e) => {
                e.stopPropagation()
                void handleRemovePhoto()
              }}
              aria-label={`Remove photo for ${fighterName}`}
            >
              ✕
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="photo-file-input"
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      <div className="fighter-card-header">
        <h2>{fighterName}</h2>
        {card.fighter && (
          <span className="points-pill" aria-label={ui.pointsAriaLabel(card.fighter.points)}>
            <span className="points-value">{card.fighter.points}</span>
            <span className="points-unit">{ui.pointsUnit}</span>
          </span>
        )}
      </div>

      {card.fighter ? (
        <div className="fighter-card-body">
          <dl className="stats-grid">
            <div>
              <dt>
                <img className="stat-icon" src={characteristicIconPath('move')} alt={ui.moveLabel} />
              </dt>
              <dd>{card.fighter.movement}</dd>
            </div>
            <div>
              <dt>
                <img className="stat-icon" src={characteristicIconPath('toughness')} alt={ui.toughnessLabel} />
              </dt>
              <dd>{card.fighter.toughness}</dd>
            </div>
            <div>
              <dt>
                <img className="stat-icon" src={characteristicIconPath('wounds')} alt={ui.woundsLabel} />
              </dt>
              <dd>{card.fighter.wounds}</dd>
            </div>
            <div>
              <dt>
                <img className="stat-icon" src={withBasePath('black_flag.svg')} alt={ui.braveLabel} />
              </dt>
              <dd>{card.fighter.brave ?? '-'}</dd>
            </div>
          </dl>

          <WeaponSection fighterId={card.fighter._id} weapons={card.fighter.weapons} ui={ui} />

          <section className="abilities-bottom">
            <AbilitySection abilities={card.abilities} ui={ui} />
          </section>
        </div>
      ) : (
        <p className="unmatched">{ui.unmatchedFighter}</p>
      )}
    </article>
  )
}

