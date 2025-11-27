"use client"

import React from 'react'

interface Props {
  htmlFor?: string
  className?: string
  children: React.ReactNode
}

export default function FormLabel({ htmlFor, className = '', children }: Props) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
      {children}
    </label>
  )
}
