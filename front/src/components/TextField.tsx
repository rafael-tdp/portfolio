"use client"

import React from 'react'
import FormLabel from './FormLabel'

type TextFieldProps = {
  id?: string
  label?: React.ReactNode
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  rows?: number
  textarea?: boolean
  disabled?: boolean
  title?: string
}

export default function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  className = '',
  rows = 4,
  textarea = false,
  disabled = false,
  title,
}: TextFieldProps) {
  const base = 'mt-1 block w-full rounded-md border-gray-200 p-2 focus:outline-none border bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed border-gray-200 text-sm'

  return (
    <div>
      {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
      {textarea ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${base} ${className} text-sm`}
          disabled={disabled}
          title={title}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder || (label ? String(label) : '')}
          className={`${base} ${className}`}
          disabled={disabled}
          title={title}
        />
      )}
    </div>
  )
}
