"use client"

import React, { useState } from 'react'

interface Props { description: string }

export default function JobDescriptionToggle({ description }: Props) {
  const [open, setOpen] = useState(false)

  if (!description) return <div className="text-sm text-gray-500">Aucune description fournie.</div>

  // parse **bold** to React nodes
  const renderWithBold = (text: string) => {
    const nodes: React.ReactNode[] = []
    const re = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = re.exec(text)) !== null) {
      const idx = match.index
      if (idx > lastIndex) nodes.push(text.slice(lastIndex, idx))
      nodes.push(<strong key={idx} className="font-semibold">{match[1]}</strong>)
      lastIndex = idx + match[0].length
    }
    if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
    return nodes
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 text-sm hover:bg-gray-200"
        aria-expanded={open}
      >
        {open ? 'Masquer la fiche de poste' : 'Afficher la fiche de poste'}
      </button>

      {open && (
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'inherit' }}>
          {renderWithBold(description)}
        </div>
      )}
    </div>
  )
}
