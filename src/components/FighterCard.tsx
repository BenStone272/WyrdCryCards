import { useEffect, useRef, useState } from 'react'
import type { UiText } from '../i18n/uiText'
import type { ImportedCard } from '../types/cards'
import { characteristicIconPath, withBasePath } from '../utils/cardHelpers'
import { AbilitySection } from './AbilitySection'
import { WeaponSection } from './WeaponSection'
import { deletePhoto, loadPhoto, savePhoto, savePhotoOffset } from '../utils/photoStore'

type FighterCardProps = {
  card: ImportedCard
  runemarkPlacement: 'under-name' | 'bottom'
  ui: UiText
  isEditMode?: boolean
  onTogglePrintSide?: () => void
}

export function FighterCard({ card, ui, isEditMode = true, onTogglePrintSide }: FighterCardProps) {
  const fighterName = card.fighter?.name ?? card.importedName
  const photoKey = card.cardKey

  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoOffsetY, setPhotoOffsetY] = useState(50)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const displayedUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!photoKey) return
    let cancelled = false

    void loadPhoto(photoKey)
      .then((loadedPhoto) => {
        if (cancelled) {
          if (loadedPhoto.url) URL.revokeObjectURL(loadedPhoto.url)
          return
        }
        displayedUrlRef.current = loadedPhoto.url
        setPhotoUrl(loadedPhoto.url)
        setPhotoOffsetY(loadedPhoto.offsetY)
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
      const url = await savePhoto(photoKey, file, photoOffsetY)
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
    setPhotoOffsetY(50)
  }

  function handleOffsetChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextOffset = Number(event.target.value)
    setPhotoOffsetY(nextOffset)

    if (photoUrl && photoKey) {
      void savePhotoOffset(photoKey, nextOffset).catch((err) => {
        console.warn('Failed to save photo framing', err)
      })
    }
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
          <img className="fighter-card-photo-img" src={photoUrl} alt={fighterName} style={{ objectPosition: `50% ${photoOffsetY}%` }} />
        ) : (
          <div className="fighter-card-photo-placeholder" />
        )}
        {photoUrl && isEditMode && (
          <div className="photo-frame-slider-wrap no-print" onClick={(e) => e.stopPropagation()}>
            <input
              type="range"
              min={0}
              max={100}
              value={photoOffsetY}
              onChange={handleOffsetChange}
              aria-label={`Adjust vertical framing for ${fighterName}`}
              className="photo-frame-slider"
            />
          </div>
        )}
        {isEditMode && (
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
        )}
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

