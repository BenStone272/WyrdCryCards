import { useState } from 'react'

type IconWithFallbackProps = {
  candidates: string[]
  alt: string
  className: string
  title?: string
}

export function IconWithFallback({ candidates, alt, className, title }: IconWithFallbackProps) {
  const [candidateIndex, setCandidateIndex] = useState(0)

  if (candidateIndex >= candidates.length) {
    return null
  }

  return (
    <img
      className={className}
      src={candidates[candidateIndex]}
      alt={alt}
      title={title}
      onError={() => setCandidateIndex((prev) => prev + 1)}
    />
  )
}
