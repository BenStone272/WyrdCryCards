import type { ImportedCard, WarbandHeaderInfo } from '../types/cards'

type CardBackProps = {
  card: ImportedCard
  warbandInfo: WarbandHeaderInfo | null
}

export function CardBack({ card, warbandInfo }: CardBackProps) {
  const fighterName = card.fighter?.name ?? card.importedName
  const warbandName = warbandInfo?.warbandName ?? warbandInfo?.warbandSlug ?? 'Warband'
  const describedAbilities = [...card.abilities, ...card.reactions]

  return (
    <article className="fighter-card fighter-card-back" aria-label={`Back of ${fighterName}`}>
      <div className="card-back-frame">
        <p className="card-back-overline">Ability Reference</p>
        <h2>{fighterName}</h2>
        <p className="card-back-warband">{warbandName}</p>
        <div className="card-back-divider" aria-hidden="true" />

        {describedAbilities.length === 0 ? (
          <p className="card-back-note">No matching abilities or reactions.</p>
        ) : (
          <ul className="card-back-ability-list">
            {describedAbilities.map((ability) => (
              <li key={ability._id} className="card-back-ability-item">
                <p className="card-back-ability-heading">
                  <span className="card-back-ability-name">{ability.name}</span>
                  <span className="card-back-ability-cost">{ability.cost}</span>
                </p>
                <p className="card-back-ability-description">{ability.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
