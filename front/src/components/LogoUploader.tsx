"use client"

import React, { useCallback, useState, useRef, useEffect } from 'react'
import Button from './Button'

interface Props {
  onFileChange: (file: File | null) => void
  initialUrl?: string | null
}

export default function LogoUploader({ onFileChange, initialUrl = null }: Props) {
  const [preview, setPreview] = useState<string | null>(initialUrl)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setPreview(initialUrl)
  }, [initialUrl])

  const handleFiles = useCallback((file: File | null) => {
    if (!file) {
      setPreview(null)
      onFileChange(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    onFileChange(file)
  }, [onFileChange])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleFiles(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFiles(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const openFile = () => inputRef.current?.click()

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-1 rounded-md p-4 flex items-center gap-4 justify-between ${dragActive ? 'border-sky-400 bg-sky-50' : 'border-gray-200 bg-white'}`}
      >
        <div className="flex items-center gap-4">
          {preview ? (
            <img src={preview} alt="preview" className="w-24 h-24 object-contain rounded" />
          ) : (
            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center text-gray-400">Logo</div>
          )}
          <div>
            <div className="text-sm font-medium">Drag & drop ou sélectionne un fichier</div>
            <div className="text-xs text-gray-500">PNG, JPG, SVG — max 5MB</div>
            <div className="mt-2">
            <Button type="button" onClick={openFile} className="px-3 py-1 mr-2">Choisir</Button>
            <Button type="button" onClick={() => handleFiles(null)} className="px-3 py-1">Supprimer</Button>
            </div>
          </div>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
      </div>
    </div>
  )
}
