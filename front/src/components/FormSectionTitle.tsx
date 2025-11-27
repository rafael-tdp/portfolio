"use client"

import React from 'react'

type Props = {
  className?: string
  children: React.ReactNode
}

export default function FormSectionTitle({ className = '', children }: Props) {
  return (
    <h2 className={`text-lg font-normal mb-3 text-gray-800 ${className}`}>
      {children}
    </h2>
  )
}
